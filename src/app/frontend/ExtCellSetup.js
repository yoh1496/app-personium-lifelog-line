import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import {
  usePersoniumAuthentication,
  usePersoniumConfig,
} from './lib/Personium/Context';
import { AppConstant } from './Constants/AppConstant';

function parseCellUrl(cellUrl) {
  // only support per-cell
  const urlPart = new URL(cellUrl).hostname.split('.');
  return [urlPart[0], urlPart.slice(1).join('.')];
}

function extractBoxName(boxUrl) {
  // boxUrl: https://foo.pds.example.com/box-name/
  return new URL(boxUrl).pathname
    .split('/')
    .filter(i => i !== '')
    .slice(-1)[0];
}

function getRelationalURI(originUrl, targetUrl) {
  const [targetCellName, targetUnitFQDN] = parseCellUrl(targetUrl);
  if (parseCellUrl(originUrl)[1] === targetUnitFQDN) {
    return `personium-localunit:${targetCellName}:/`;
  }
  return targetUrl;
}

async function registerExtCell(cellUrl, extCellUrl, access_token) {
  const url = `${cellUrl}__ctl/ExtCell`;
  console.log(extCellUrl);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Url: getRelationalURI(cellUrl, extCellUrl),
    }),
  });
  return res.json();
}

async function getExtCell(cellUrl, extCellUrl, access_token) {
  const extCellUrlRelational = getRelationalURI(cellUrl, extCellUrl);
  const url = `${cellUrl}__ctl/ExtCell('${encodeURIComponent(
    extCellUrlRelational
  )}')`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
    },
  });
  if (res.status === 404) {
    return null;
  }
  return res.json();
}

async function assignRole(objURI, roleURI, access_token) {
  const url = `${objURI}/$links/_Role`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uri: roleURI }),
  });
  return res.ok;
}

async function getExtCellRoles(cellUrl, extCellUrl, access_token) {
  const extCellData = await getExtCell(cellUrl, extCellUrl, access_token);
  const deferredRoleUrl = extCellData.d.results._Role.__deferred.uri;
  return getRoles(deferredRoleUrl);
}

async function getRole(ctlRoleUrl, { roleName, boxName }, access_token) {
  const url = composeRoleUrl(ctlRoleUrl, roleName, boxName);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
    },
  });
  if (res.status === 404) {
    return null;
  }
  return res.json();
}
async function getRoles(ctlRoleUrl, access_token) {
  const res = await fetch(ctlRoleUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
    },
  });
  return res.json();
}

function composeRoleUrl(ctlRoleUrl, roleName, boxName) {
  if (boxName === null || boxName === undefined) {
    return `${ctlRoleUrl}('${roleName}')`;
  }
  return `${ctlRoleUrl}(Name='${roleName}',_Box.Name='${boxName}')`;
}

async function findExtCell(ctlExtCellUrl, targetCell, access_token) {
  const params = ['$filter', `Url eq '${targetCell}'`].join('=');
  const url = `${ctlExtCellUrl}?${params}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
    },
  });
  return res.json();
}

function useExtCellRegisterStatus(cellUrl, targetCellUrl, access_token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const [registered, setRegistered] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const extCell = await getExtCell(cellUrl, targetCellUrl, access_token);

      if (extCell === null) {
        setRegistered(false);
      } else {
        setRegistered(true);
      }
    } catch (e) {
      setError(i => [...i, JSON.stringify(e)]);
    } finally {
      setLoading(false);
    }
  }, [cellUrl, targetCellUrl, access_token]);

  return { loading, error, registered, refresh };
}

function useExtCellRoleStatus(cellUrl, targetCellUrl, access_token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const { boxUrl } = useBoxUrl();

  const [isExtCellRegistered, setIsExtCellRegistered] = useState(false);
  const [isRoleAssignedToExtCell, setIsRoleAssignedToExtCell] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError([]);

    try {
      const roleName = 'LineEventWriter';
      const boxName = extractBoxName(boxUrl);
      const targetCell = getRelationalURI(cellUrl, targetCellUrl);

      const extCell = await getExtCell(cellUrl, targetCellUrl, access_token);

      if (extCell === null) {
        setIsExtCellRegistered(false);
      } else {
        setIsExtCellRegistered(true);
      }

      // There must be the role.
      const ctlRoleUrl = composeRoleUrl(
        `${cellUrl}__ctl/Role`,
        roleName,
        boxName
      );
      const ctlExtCellUrl = `${ctlRoleUrl}/_ExtCell`;

      // const role = await getRole(
      //   `${config.targetCellUrl}__ctl/Role`,
      //   {
      //     roleName: 'LineEventWriter',
      //     boxName: extractBoxName(boxUrl),
      //   },
      //   auth.access_token
      // );
      // if (role === null) {
      //   throw 'The box installed is corrupt';
      // }
      // const ctlExtCellUrl = role.d.results._ExtCell.__deferred.uri;

      const extCells = await findExtCell(
        ctlExtCellUrl,
        targetCell,
        access_token
      );
      if (extCells.d.results.length > 0) {
        // App Cell is registered as ExtCell and assigned correct Role.
        setIsRoleAssignedToExtCell(true);
      } else {
        setIsRoleAssignedToExtCell(false);
      }
    } catch (e) {
      setError(i => [...i, JSON.stringify(e)]);
    } finally {
      setLoading(false);
    }
  }, [cellUrl, targetCellUrl, access_token, boxUrl]);

  const handleRegisterExtCell = useCallback(async () => {
    setLoading(true);
    try {
      await registerExtCell(cellUrl, targetCellUrl, access_token);
      await refresh();
    } catch (e) {
      setError(i => [...i, e]);
    } finally {
      setLoading(false);
    }
  }, [cellUrl, targetCellUrl, access_token, refresh]);

  const handleAssignRoleToExtCell = useCallback(async () => {
    setLoading(true);
    try {
      const extCell = await getExtCell(cellUrl, targetCellUrl, access_token);
      if (extCell === null) {
        throw 'ExtCell is not found';
      }

      const roleName = 'LineEventWriter';
      const boxName = extractBoxName(boxUrl);
      console.log(extCell);
      await assignRole(
        extCell.d.results.__metadata.uri,
        composeRoleUrl(`${cellUrl}__ctl/Role`, roleName, boxName),
        access_token
      );

      await refresh();
    } catch (e) {
      setError(i => [...i, JSON.stringify(e)]);
    } finally {
      setLoading(false);
    }
  }, [cellUrl, boxUrl, targetCellUrl, access_token, refresh]);

  return {
    loading,
    error,
    refresh,
    handleRegisterExtCell,
    handleAssignRoleToExtCell,
    isExtCellRegistered,
    isRoleAssignedToExtCell,
  };
}

export const ExtCellSetupView = () => {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
  const {
    loading,
    error,
    refresh,
    handleRegisterExtCell,
    handleAssignRoleToExtCell,
    isExtCellRegistered,
    isRoleAssignedToExtCell,
  } = useExtCellRoleStatus(
    config.targetCellUrl,
    AppConstant.cellUrl,
    auth.access_token
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <h3>
        外部セル登録状況
        <button type="button" onClick={refresh}>
          更新
        </button>
      </h3>
      {loading ? (
        <>読込中</>
      ) : (
        (() => {
          if (error.length > 0) {
            return (
              <div>
                <h4>error</h4>
                {JSON.stringify(error)}
              </div>
            );
          }
          if (!isExtCellRegistered) {
            return (
              <div>
                <span>外部セル未登録</span>
                <button onClick={handleRegisterExtCell}>登録する</button>
              </div>
            );
          }
          if (!isRoleAssignedToExtCell) {
            return (
              <div>
                <span>外部セル登録済み、Role未付与</span>
                <button onClick={handleAssignRoleToExtCell}>付与する</button>
              </div>
            );
          }
          return <span>外部セル登録済み、Role付与済み</span>;
        })()
      )}
    </>
  );
};

ExtCellSetupView.propTypes = {};
