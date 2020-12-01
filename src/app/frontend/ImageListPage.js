import React from 'react';
import PropTypes from 'prop-types';

const { Segment, ImageGroup, Image } = require('semantic-ui-react');

const ImageListPage = props => {
  const { images, p_cookie_peer, userBoxUrl } = props;
  return (
    <Segment>
      <ImageGroup>
        {(() => {
          return images.map(image_id => {
            const imgUrl = `${userBoxUrl}data/binary/${image_id}?p_cookie_peer=${p_cookie_peer}`;
            return <Image size="small" src={imgUrl} key={image_id}></Image>;
          });
        })()}
      </ImageGroup>
    </Segment>
  );
};

ImageListPage.propTypes = {
  images: PropTypes.arrayOf(PropTypes.objectOf()),
  p_cookie_peer: PropTypes.string,
  userBoxUrl: PropTypes.string,
};

export { ImageListPage };
