// pages/previewProduct.tsx
import PreviewProduct from "@/components/previewProduct";
import Link from 'next/link';

const PreviewPage: React.FC = () => {


    return (
        <div className="container mx-auto p-4">
            <PreviewProduct />
            <Link href="/designer_tool/products" passHref>
                <button
                    className="bg-blue-500 hidden text-white text-xs p-[2vw] ml-[32.5vw] py-2 rounded-full bg-gradient-to-r from-[#004CFF] to-[#3471FF]"
                >
                    Change Product
                </button>
            </Link>
        </div>
    );
};

export default PreviewPage;
