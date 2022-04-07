import React from 'react';
import Styles from './spinner.module.scss';

const Spinner = () => {
  return <div className={Styles.ldsEllipsis}><div></div><div></div><div></div><div></div></div>;
};

export default Spinner;