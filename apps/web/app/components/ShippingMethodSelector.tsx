import { ShippingMethod } from "@monkeyprint/db";

interface ShippingMethodSelectorProps {
  selectedMethod: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
}

export default function ShippingMethodSelector({
  selectedMethod,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <div className="mb-6">
      <h2 className="font-raleway font-semibold text-lg mb-3">
        Shipping Method
      </h2>
      <div className="space-y-3">
        <div
          className={`border rounded-lg p-3 flex justify-between items-center ${
            selectedMethod === ShippingMethod.STANDARD
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200"
          }`}
          onClick={() => onSelect(ShippingMethod.STANDARD)}
        >
          <div>
            <h3 className="font-medium">Standard Delivery</h3>
            <p className="text-xs text-gray-500">
              Delivery in 3-5 business days
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">5dt</span>
            {selectedMethod === ShippingMethod.STANDARD && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div
          className={`border rounded-lg p-3 flex justify-between items-center ${
            selectedMethod === ShippingMethod.EXPRESS
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200"
          }`}
          onClick={() => onSelect(ShippingMethod.EXPRESS)}
        >
          <div>
            <h3 className="font-medium">Express Delivery</h3>
            <p className="text-xs text-gray-500">
              Delivery in 1-2 business days
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">7dt</span>
            {selectedMethod === ShippingMethod.EXPRESS && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
