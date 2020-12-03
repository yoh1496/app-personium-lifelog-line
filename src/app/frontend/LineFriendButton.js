import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const id = `script-${Math.random().toString()}`;

export function LineFriendButton(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js';
    script.async = 'async';
    script.defer = 'defer';
    script.onload = () => {
      window.LineIt.loadButton();
      setLoading(false);
    };
    document.getElementById(id).replaceWith(script);
  }, []);

  return (
    <>
      {loading ? null : null /* do nothing */}
      <div
        className="line-it-button"
        data-lang="ja"
        data-type="friend"
        data-lineid={props.friendId}
        data-count="true"
        style={{ display: 'none' }}
      ></div>
      <div id={id}></div>
    </>
  );
}

LineFriendButton.propTypes = {
  friendId: PropTypes.string,
  loading: PropTypes.node,
};

export default LineFriendButton;
