import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const { Segment, ImageGroup, Image, Card } = require('semantic-ui-react');

const ImageListPage = props => {
  const { images, p_cookie_peer, userBoxUrl } = props;
  return (
    <Segment>
      <Card.Group>
        {(() => {
          return images.map(item => {
            const { id, datatype } = item;
            console.log(item);
            if (datatype === 'image') {
              const imgUrl = `${userBoxUrl}data/binary/${id}?p_cookie_peer=${p_cookie_peer}`;
              return <ImageCard src={imgUrl} key={id} />;
            } else {
              const textUrl = `${userBoxUrl}data/binary/${id}?p_cookie_peer=${p_cookie_peer}`;
              return <TextCard src={textUrl} key={id} />;
            }
          });
        })()}
      </Card.Group>
    </Segment>
  );
};

ImageListPage.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      datatype: PropTypes.string.isRequired,
    })
  ).isRequired,
  p_cookie_peer: PropTypes.string,
  userBoxUrl: PropTypes.string,
};

export { ImageListPage };
