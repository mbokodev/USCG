import styled from "styled-components";
// GLOBAL CUSTOM COMPONENTS
import { Button } from "@component/ui/buttons";
import Typography from "@component/ui/Typography";

// STYLED COMPONENT
const StyledCarouselCard1 = styled.div`
  display: flex;
  text-align: left;
  margin-left: 280px;
  align-items: center;
  padding: 1rem 0 1rem 2rem;
  justify-content: space-between;
  gap: 3rem;

  .content {
    max-width: 500px;
    .title {
      font-size: 50px;
      margin-top: 0px;
      line-height: 1.2;
      margin-bottom: 1.35rem;
    }
    .description {
      max-width: 400px;
    }
  }

  .image-holder {
    position: relative;
    max-width: 300px;
    img {
      width: 100%;
    }
  }

  @media only screen and (max-width: 900px) {
    margin-left: 0px;
    padding: 1rem;
    gap: 2rem;

    .content {
      .title {
        font-size: 32px;
      }
    }
  }

  @media only screen and (max-width: 600px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 1.5rem;
    padding: 1rem;

    .content {
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        font-size: 24px;
        margin-bottom: 1rem;
      }
      .description {
        max-width: 100%;
        font-size: 14px;
      }
    }

    .image-holder {
      max-width: 200px;
      margin: 0 auto;
    }

    .button-link {
      font-size: 14px;
      padding: 0.75rem 1.25rem;
    }
  }

  @media only screen and (max-width: 425px) {
    .content {
      .title {
        font-size: 20px;
      }
      .description {
        font-size: 13px;
      }
    }

    .image-holder {
      max-width: 150px;
    }

    .button-link {
      font-size: 13px;
      padding: 0.66rem 0.95rem;
    }
  }
`;

// ===============================================
interface Props {
  title: string;
  image: string;
  buttonText: string;
  description: string;
}
// ===============================================

export default function CarouselCard1({ title, image, buttonText, description }: Props) {
  return (
    <StyledCarouselCard1>
      <div className="content">
        <h1 className="title">{title}</h1>
        <Typography className="description" color="secondary.main" mb="1.35rem">
          {description}
        </Typography>

        <Button className="button-link" variant="contained" color="primary" p="1rem 1.5rem">
          {buttonText}
        </Button>
      </div>

      <div className="image-holder">
        <img src={image} alt="banner-image" />
      </div>
    </StyledCarouselCard1>
  );
}
