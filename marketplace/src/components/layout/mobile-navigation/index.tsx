import styled from "styled-components";

import Icon from "@component/ui/icon/Icon";
import NavLink from "@component/ui/nav-link";
import useWindowSize from "@hook/useWindowSize";
import { layoutConstant } from "@utils/constants";

// STYLED COMPONENT
const Wrapper = styled.div`
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  position: fixed;
  align-items: center;
  justify-content: space-around;
  height: ${layoutConstant.mobileNavHeight};
  background: ${({ theme }) => theme.colors.body.paper};
  box-shadow: 0px 1px 4px 3px rgba(0, 0, 0, 0.1);
  z-index: 999;

  .link {
    flex: 1 1 0;
    display: flex;
    font-size: 13px;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .icon {
      display: flex;
      margin-bottom: 4px;
      align-items: center;
      justify-content: center;
    }
  }

  @media (max-width: 900px) {
    display: flex;
    width: 100vw;
  }
`;

export default function MobileNavigationBar() {
  const width = useWindowSize();

  if (width <= 900) {
    return (
      <Wrapper>
        {list.map((item) => (
          <NavLink className="link" href={item.href} key={item.title}>
            <Icon className="icon" variant="small">
              {item.icon}
            </Icon>
            {item.title}
          </NavLink>
        ))}
      </Wrapper>
    );
  }

  return null;
}

const list = [
  { title: "Accueil", icon: "home", href: "/" },
  { title: "Catégories", icon: "category", href: "/categories" },
  { title: "Compte", icon: "user-2", href: "/profile" }
];
