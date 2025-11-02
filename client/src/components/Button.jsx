// src/components/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, className, ...props }) => {
  const btnClass = classNames(
    `btn btn-${variant} btn-${size}`,
    { 'btn-disabled': disabled },
    className
  );

  return (
    <button className={btnClass} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Button;
