import React from 'react';
import DefaultNavbarItem from '@theme-original/NavbarItem';
import AudioPlayer from './ComponentTypes/AudioPlayer';

const NavbarItemTypeMap = {
  'custom-AudioPlayer': AudioPlayer,
};

export default function NavbarItem(props) {
  const { type } = props;
  const NavbarItemComponent = NavbarItemTypeMap[type];

  if (NavbarItemComponent) {
    return <NavbarItemComponent {...props} />;
  }

  return <DefaultNavbarItem {...props} />;
}
