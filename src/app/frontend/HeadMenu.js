import React from 'react';
import PropTypes from 'prop-types';

import { Menu, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export function HeadMenu({ onMenuClick, activeItem }) {
  return (
    <Menu pointing fixed="top" inverted>
      <Container>
        <Menu.Item
          as={Link}
          to="/timeline"
          name="Timeline"
          active={activeItem === 'Timeline'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/photos"
          name="Photos"
          active={activeItem === 'Photos'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/info"
          name="Cell"
          active={activeItem === 'Cell'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/line"
          name="LINE"
          active={activeItem === 'LINE'}
          onClick={onMenuClick}
        />
      </Container>
    </Menu>
  );
}

HeadMenu.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  activeItem: PropTypes.string.isRequired,
};
