import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ImageCard, TextCard } from './TimelineItems';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { TimelineFilter } from './TimelineFilter';
import { useParams } from 'react-router-dom';

const { Segment, Card } = require('semantic-ui-react');

export const Timeline = props => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = usePersoniumAuthentication();
  const { boxUrl } = useBoxUrl();
  const { year, month, day } = useParams();

  useEffect(() => {
    // download lists
    const { access_token } = auth;

    fetch(`${boxUrl}receivedData/receivedMessage`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then(res => {
        if (!res.ok)
          return res.text().then(statusText => {
            throw { status: res.status, statusText };
          });
        return res.json();
      })
      .then(jsonDat => {
        setItems(
          Object.values(jsonDat.d.results).map(item => ({
            id: item.__id,
            datatype: item.datatype,
          }))
        );
        setLoading(false);
      });
  }, [auth, boxUrl]);

  return (
    <>
      <TimelineFilter year={year} month={month} day={day} />
      <Segment>
        <Card.Group>
          {(() => {
            return items.map(item => {
              const { id, datatype } = item;
              console.log(item);
              if (datatype === 'image') {
                const imgUrl = `${boxUrl}data/binary/${id}?p_cookie_peer=${auth.p_cookie_peer}`;
                return <ImageCard src={imgUrl} key={id} />;
              } else {
                const textUrl = `${boxUrl}data/binary/${id}?p_cookie_peer=${auth.p_cookie_peer}`;
                return <TextCard src={textUrl} key={id} />;
              }
            });
          })()}
        </Card.Group>
      </Segment>
    </>
  );
};

Timeline.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      datatype: PropTypes.string.isRequired,
    })
  ).isRequired,
  p_cookie_peer: PropTypes.string,
  userBoxUrl: PropTypes.string,
};
