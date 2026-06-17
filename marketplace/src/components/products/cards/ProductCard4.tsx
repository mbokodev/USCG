import Rating from "@component/ui/rating";
import FlexBox from "@component/ui/FlexBox";
import HoverBox from "@component/ui/HoverBox";
import NextImage from "@component/ui/NextImage";
import { H4, Small } from "@component/ui/Typography";
import { currency } from "@utils/utils";

// =======================================================
type ProductCard4Props = {
  title: string;
  price: number;
  rating: number;
  imgUrl: string;
  reviewCount: number;
};
// =======================================================

export default function ProductCard4(props: ProductCard4Props) {
  const { imgUrl, rating, title, price, reviewCount } = props;

  return (
    <div>
      <HoverBox mb="1rem" mx="auto" borderRadius={8} display="flex">
        <NextImage src={imgUrl} width={100} height={100} alt={title} />
      </HoverBox>

      <FlexBox justifyContent="center" alignItems="center" mb="0.25rem">
        <Rating value={rating} color="warn" size="small" />

        <Small fontWeight="600" pl="0.25rem">
          ({reviewCount})
        </Small>
      </FlexBox>

      <H4 fontWeight="600" fontSize="14px" textAlign="center" mb="0.25rem" title={title} ellipsis>
        {title}
      </H4>

      <H4 fontWeight="600" fontSize="14px" textAlign="center" color="primary.main">
        {currency(price)}
      </H4>
    </div>
  );
}
