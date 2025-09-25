import React from 'react';

const PositionIcon4 = ({ className = '', style = {} }) => {
  return (
    <svg
      aria-hidden="true"
      width="2.8rem"
      height="2rem"
      viewBox="0 0 280 196"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`drop-shadow-lg ${className}`}
      style={style}
    >
      <defs>
        <linearGradient id="gradient_normal_4" x1="0.8" x2="0" y1="1.2" y2="0">
          <stop offset="1.68%" stopColor="#000000"></stop>
          <stop offset="19.76%" stopColor="#2F2C30"></stop>
          <stop offset="26.99%" stopColor="#423C43"></stop>
          <stop offset="34.32%" stopColor="#5D595F"></stop>
          <stop offset="46.44%" stopColor="#9C9C9C"></stop>
          <stop offset="53.66%" stopColor="#D2C9D4"></stop>
          <stop offset="59.74%" stopColor="#E6E6E6"></stop>
          <stop offset="64.98%" stopColor="#DBDBDB"></stop>
          <stop offset="73.35%" stopColor="#BDB8BA"></stop>
          <stop offset="77.09%" stopColor="#B9B2B5"></stop>
          <stop offset="87.31%" stopColor="#D6CCD6"></stop>
          <stop offset="92.69%" stopColor="#E2DBE1"></stop>
          <stop offset="98.15%" stopColor="#D0C4C8"></stop>
        </linearGradient>
        <linearGradient id="gradient_active_4" x1="0.8" x2="0" y1="1.2" y2="0">
          <stop offset="-1.21%" stopColor="#858CF0"></stop>
          <stop offset="6.32%" stopColor="#75C3F0"></stop>
          <stop offset="11.63%" stopColor="#6EDBF0"></stop>
          <stop offset="18.09%" stopColor="#7BACF0"></stop>
          <stop offset="24.2%" stopColor="#848CF0"></stop>
          <stop offset="33.17%" stopColor="#C28DF8"></stop>
          <stop offset="39.59%" stopColor="#BAA5BE"></stop>
          <stop offset="46.58%" stopColor="#C6BAC9"></stop>
          <stop offset="54.28%" stopColor="#EBE7EC"></stop>
          <stop offset="60.78%" stopColor="#FFFFFF"></stop>
          <stop offset="66.37%" stopColor="#EAEAEA"></stop>
          <stop offset="75.3%" stopColor="#BDB8BA"></stop>
          <stop offset="79.29%" stopColor="#B9B2B5"></stop>
          <stop offset="90.2%" stopColor="#F2DFF2"></stop>
          <stop offset="95.95%" stopColor="#E6D6E4"></stop>
          <stop offset="101.78%" stopColor="#D0C4C8"></stop>
        </linearGradient>
      </defs>
      <g id="num_4-masks_group" mask="url(#num_4-masks)">
        <path
          id="num_4-shape"
          d="M48.200000,20L77.900000,20L59.200000,73.500000L200.300000,73.500000L218.900000,20L248.500000,20L229.900000,73.500000L270.200000,73.500000L260.600000,101.500000L220.100000,101.500000L194.300000,176L164.700000,176L190.600000,101.500000L19.800000,101.500000L48.200000,20Z"
          fill="url(#gradient_normal_4)"
          stroke="none"
          strokeWidth="1"
        ></path>
        <mask id="num_4-masks" mask-type="luminance">
          <path
            id="num_4-mask_1"
            d="M66,11.500000L39.500000,87.500000L271,87.500000"
            fill="none"
            stroke="rgb(255,255,255)"
            strokeWidth="28"
            strokeDashoffset="935.97"
            strokeDasharray="311.990000"
          ></path>
          <path
            id="num_4-mask_2"
            d="M236.500000,12L176.500000,184.500000"
            fill="none"
            stroke="rgb(255,255,255)"
            strokeWidth="28"
            strokeDashoffset="547.92"
            strokeDasharray="182.640000"
          ></path>
        </mask>
      </g>
      <g>
        <path
          d="M48.200000,20L77.900000,20L59.200000,73.500000L200.300000,73.500000L218.900000,20L248.500000,20L229.900000,73.500000L270.200000,73.500000L260.600000,101.500000L220.100000,101.500000L194.300000,176L164.700000,176L190.600000,101.500000L19.800000,101.500000L48.200000,20Z"
          fill="url(#gradient_active_4)"
          stroke="none"
          strokeWidth="1"
        ></path>
      </g>
    </svg>
  );
};

export default PositionIcon4;