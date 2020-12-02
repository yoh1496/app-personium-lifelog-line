import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const { Image, Card } = require('semantic-ui-react');

export const ImageCard = props => {
  const { src } = props;
  return (
    <Card>
      <Image src={src} wrapped ui={false} />
    </Card>
  );
};

ImageCard.propTypes = {
  src: PropTypes.string.isRequired,
};

export const TextCard = props => {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(null);
  const { src } = props;

  useEffect(() => {
    fetch(src, { credentials: 'include' })
      .then(res => {
        if (!res.ok)
          return res.text().then(statusText => {
            throw { status: res.status, statusText };
          });
        return res.json();
      })
      .then(jsonDat => {
        setText(jsonDat.text);
        setLoading(false);
      });
  }, [src]);

  if (loading) return <p>Loading...</p>;

  return (
    <Card>
      <Card.Content>
        <Card.Header>TextMessage</Card.Header>
        <Card.Description>{text}</Card.Description>
      </Card.Content>
    </Card>
  );
};

TextCard.propTypes = {
  src: PropTypes.string.isRequired,
};
