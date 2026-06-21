import styled, { css, keyframes } from "styled-components";

const rotate = keyframes`
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
`;

interface SpinnerProps {
  size?: number;
}

const Spinner = styled.div<SpinnerProps>(
  ({ size = 24 }) => ({
    width: size,
    height: size,
    border: "4px solid",
    borderRadius: "50%",
    borderTop: "3px solid white",
    borderColor: "primary",
    transitionProperty: "transform"
  }),
  css`
    animation: ${rotate} 1.2s infinite linear;
  `
);

export default Spinner;
