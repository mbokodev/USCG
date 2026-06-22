import Card from "@component/ui/Card";
import styled from "styled-components";

export const AuthWrapper = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

export const StyledRoot = styled(Card)`
  border-radius: 12px;
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  width: 500px;
  overflow: hidden;

  .content {
    padding: 3rem 3.75rem 0px;
  }

  @media screen and (max-width: 550px) {
    width: 90%;
    .content {
      padding: 1.5rem 1rem 0px;
    }
  }
`;
