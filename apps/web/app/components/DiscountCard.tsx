import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import Link from "next/link";

interface BannerProps {
  id?: string;
  imageUrl?: string | null;
  title?: string | null;
  titleColor?: string | null;
  description?: string | null;
  descriptionColor?: string | null;
  backgroundColor?: string | null;
  button?: {
    buttonText: string;
    buttonLink: string;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
  } | null;
}

export default function DiscountCard({ banner }: { banner?: BannerProps }) {
  // Use default values if no banner is provided
  const title = banner?.title || "Big Sale";
  const description = banner?.description || "Up to 50%";
  const titleColor = banner?.titleColor || "#ffffff";
  const descriptionColor = banner?.descriptionColor || "#ffffff";
  const bgImage = banner?.imageUrl
    ? `url(${banner.imageUrl})`
    : "url('/bg-card.svg')";
  const buttonText = banner?.button?.buttonText || "Happening Now";
  const buttonLink = banner?.button?.buttonLink || "#";
  return (
    <Card
      className="w-full bg-cover bg-no-repeat bg-right-top"
      style={{
        backgroundImage: bgImage,
        backgroundColor: banner?.backgroundColor || "transparent",
      }}
    >
      <CardHeader>
        <CardTitle
          className="font-raleway font-bold text-[29px] leading-[36px] tracking-[-0.29px]"
          style={{ color: titleColor }}
        >
          {title}
        </CardTitle>
        <CardDescription
          className="font-nunito-sans font-bold text-[12px] leading-[18px]"
          style={{ color: descriptionColor }}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="font-raleway font-bold text-[11px] leading-[15px] tracking-[-0.11px]">
        <Link
          href={buttonLink}
          className="px-3 py-1.5 rounded-md "
          style={{
            color: banner?.button?.textColor || "#ffffff",
            backgroundColor: banner?.button?.backgroundColor || "transparent",
            border: banner?.button?.borderColor
              ? `1px solid ${banner.button.borderColor}`
              : "none",
          }}
        >
          {buttonText}
        </Link>
      </CardFooter>
    </Card>
  );
}
