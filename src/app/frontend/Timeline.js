import React, { useEffect, useState, useMemo } from 'react';
import { ImageCard, TextCard } from './TimelineItems';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { TimelineFilter } from './TimelineFilter';
import { useParams } from 'react-router-dom';
import { o } from 'odata';
import { addDays } from 'date-fns';

import {
  Segment,
  Card,
  Container,
  Header,
  Sticky,
  Dimmer,
} from 'semantic-ui-react';

const useTimelineContent = (year, month, day, access_token, boxUrl) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  // const oHandler = useMemo(() => {
  //   return o(`${boxUrl}`, {
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });
  // }, [boxUrl, access_token]);

  useEffect(() => {
    setLoading(true);

    const date = new Date(year, month - 1, day);
    const from = date.getTime();
    const to = addDays(date, 1).getTime() - 1;

    const oHandler = o(`${boxUrl}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    oHandler
      .get('receivedData/receivedMessage')
      .query({
        $filter: `__published ge ${from} and __published lt ${to}`,
        $format: 'json',
      })
      .then(res => {
        console.log(res);
        return res;
      })
      .then(res => {
        setItems(
          Object.values(res.d.results).map(item => ({
            id: item.__id,
            datatype: item.datatype,
          }))
        );
        setLoading(false);
      })
      .catch(res => {
        console.log('error happened: ', res);
        setError(res);
        setLoading(false);
      });
  }, [year, month, day, boxUrl, access_token]);

  return { loading, error, items };
};

export const Timeline = () => {
  const { auth } = usePersoniumAuthentication();
  const { boxUrl } = useBoxUrl();
  const { year, month, day } = useParams();
  const { loading, error, items } = useTimelineContent(
    year,
    month,
    day,
    auth.access_token,
    boxUrl
  );

  useEffect(() => {
    document.title = `${year}年${month}月${day}日のタイムライン`;
  }, [year, month, day]);

  if (error) return <div>{JSON.stringify(error)}</div>;

  return (
    <>
      <Sticky>
        <Header block>Timeline</Header>
      </Sticky>

      <Container style={{ paddingTop: '1em', paddingBottom: '7em' }}>
        <TimelineFilter year={year} month={month} day={day} />
        <Dimmer.Dimmable as={Segment} dimmed={loading}>
          <Card.Group itemsPerRow={1}>
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
        </Dimmer.Dimmable>
      </Container>
    </>
  );
};
