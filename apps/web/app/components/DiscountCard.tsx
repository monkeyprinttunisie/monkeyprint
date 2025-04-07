import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";

export default function DiscountCard() {
  return (
    <Card className="w-full bg-[url('/bg-card.svg')] bg-cover bg-no-repeat bg-right-top">
      <CardHeader>
        <CardTitle className="font-raleway font-bold text-[29px] leading-[36px] tracking-[-0.29px] text-white">
          Big Sale
        </CardTitle>
        <CardDescription className="font-nunito-sans font-bold text-[12px] leading-[18px] text-white">
          Up to 50%
        </CardDescription>
      </CardHeader>
      <CardFooter className="font-raleway font-bold text-[11px] leading-[15px] tracking-[-0.11px] text-white">
        Happening
        <br /> Now
      </CardFooter>
    </Card>
  );
}
