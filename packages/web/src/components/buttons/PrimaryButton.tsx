import React, { FC, ReactNode } from 'react';
import Spinner from '~/components/Spinner';
import Styles from './primary-button.module.scss';

interface Props {
  loading?: boolean
  children?: ReactNode | ReactNode[]
  onClick: () => void
}

const PrimaryButton: FC<Props> = ({ loading = false, children, onClick }) => (
  <button className={Styles.primaryButton} onClick={!loading ? onClick : () => {}}>
    {loading ?
      <Spinner />
    :
      children
    }
  </button>
);

export default PrimaryButton;
