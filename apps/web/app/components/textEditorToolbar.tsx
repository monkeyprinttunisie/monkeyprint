import React, { useState } from 'react';
import Image from 'next/image';

interface TextEditorToolbarProps {
    isVisible: boolean;
    selectedText: {
        fontFamily: string;
        color: string;
        size: number;
        isBold: boolean;
        alignment: 'left' | 'center' | 'right';
    } | null;
    onFontChange: (font: string) => void;
    onColorChange: (color: string) => void;
    onSizeChange: (size: number) => void;
    onToggleBold: () => void;
    onAlignmentChange: (alignment: 'left' | 'center' | 'right') => void;
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({
    isVisible,
    selectedText,
    onFontChange,
    onColorChange,
    onSizeChange,
    onToggleBold,
    onAlignmentChange,
}) => {
    const [showColorPalette, setShowColorPalette] = useState(false);
    const [showSizeControls, setShowSizeControls] = useState(false);
    const [showFontOptions, setShowFontOptions] = useState(false);
    const [showAlignOptions, setShowAlignOptions] = useState(false);

    if (!isVisible || !selectedText) return null;

    const fontOptions = [
        { value: 'Arial', label: 'Arial' },
        { value: 'Verdana', label: 'Verdana' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Georgia', label: 'Georgia' },
        { value: 'Courier New', label: 'Courier New' },
        { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    ];

    const colorOptions = [
        { value: '#000000', label: 'Black' },
        { value: '#FFFFFF', label: 'White' },
        { value: '#FF0000', label: 'Red' },
        { value: '#00FF00', label: 'Green' },
        { value: '#0000FF', label: 'Blue' },
        { value: '#FFFF00', label: 'Yellow' },
        { value: '#FF6600', label: 'Orange' },
        { value: '#800080', label: 'Purple' },
        { value: '#FFC0CB', label: 'Pink' },
        { value: '#A52A2A', label: 'Brown' },
    ];
    const alignmentOptions = [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
    ]

    return (
        <div className="fixed bottom-15 left-0 w-full z-50 p-3">
            <div
                className="flex h-[15vh] w-full bg-no-repeat bg-contain justify-center items-center mx-auto"
                style={{
                    backgroundImage: 'url("/images/toolBar.png")',
                    backgroundPosition: 'center',
                    maxWidth: '500px',
                }}
            >
                <div className="flex w-4/5 items-center justify-evenly">
                    {/* Text Font */}
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setShowFontOptions(!showFontOptions)}
                            className="w-10 h-10 flex items-center justify-center"
                            aria-label="Font options"
                        >
                            <Image
                                src="/icons/font.svg"
                                alt="Font"
                                width={24}
                                height={24}
                            />
                        </button>
                        {showFontOptions && (
                            <div className="absolute bottom-full left-0 bg-white shadow-lg rounded p-2 w-48 max-h-40 overflow-y-auto z-50">
                                {fontOptions.map(font => (
                                    <div
                                        key={font.value}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            onFontChange(font.value);
                                            setShowFontOptions(false);
                                        }}
                                        style={{ fontFamily: font.value }}
                                    >
                                        {font.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color selector */}
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setShowColorPalette(!showColorPalette)}
                            className="w-10 h-10 flex items-center justify-center"
                            aria-label="Color options"
                        >
                            <Image
                                src="/icons/textColor.svg"
                                alt="Color"
                                width={24}
                                height={24}
                            />
                        </button>
                        {showColorPalette && (
                            <div className="absolute bottom-full left-0 bg-white shadow-lg rounded p-2 w-48 z-50">
                                <div className="grid grid-cols-5 gap-2">
                                    {colorOptions.map(color => (
                                        <div
                                            key={color.value}
                                            className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => {
                                                onColorChange(color.value);
                                                setShowColorPalette(false);
                                            }}
                                            title={color.label}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Size controls */}
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setShowSizeControls(!showSizeControls)}
                            className="w-10 h-10 flex items-center justify-center"
                            aria-label="Size controls"
                        >
                            <Image
                                src="/icons/textSize.svg"
                                alt="Size"
                                width={24}
                                height={24}
                            />
                        </button>
                        {showSizeControls && (
                            <div className="absolute bottom-full left-0 bg-white shadow-lg rounded p-3 flex items-center z-50">
                                <button
                                    onClick={() => onSizeChange(Math.max(12, selectedText.size - 2))}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <span className="text-lg">−</span>
                                </button>
                                <span className="mx-3 w-8 text-center">{Math.round(selectedText.size)}</span>
                                <button
                                    onClick={() => onSizeChange(Math.min(72, selectedText.size + 2))}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <span className="text-lg">+</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bold toggle */}
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleBold();
                            }}
                            className={`w-10 h-10 flex items-center justify-center ${selectedText.isBold}`}
                            aria-label="Toggle bold"
                        >
                            <Image
                                src="/icons/bold.svg"
                                alt="Bold"
                                width={24}
                                height={24}
                            />
                        </button>

                    </div>

                    {/* Alignment */}
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setShowAlignOptions(!showAlignOptions)}
                            className="w-10 h-10 flex items-center justify-center"
                            aria-label="text alignment "
                        >
                            <Image
                                src="/icons/alignment.svg"
                                alt="Alignment"
                                width={20}
                                height={20}
                            />
                        </button>
                        {showAlignOptions && (
                            <div className="absolute bottom-full -left-15 bg-white shadow-lg rounded p-2 w-[40vw] flex space-x-2 z-40">                                <button
                                className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${selectedText.alignment === 'left' ? 'bg-blue-100' : ''}`}
                                onClick={() => {
                                    onAlignmentChange('left');
                                    setShowAlignOptions(false);
                                }}
                                title="Align Left"
                            >
                                <Image
                                    src="/icons/alignLeft.png"
                                    alt="Left"
                                    width={16}
                                    height={16}
                                />
                            </button>
                                <button
                                    className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${selectedText.alignment === 'center' ? 'bg-blue-100' : ''}`}
                                    onClick={() => {
                                        onAlignmentChange('center');
                                        setShowAlignOptions(false);
                                    }}
                                    title="Align Center"
                                >
                                    <Image
                                        src="/icons/alignment.svg"
                                        alt="Center"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                                <button
                                    className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${selectedText.alignment === 'right' ? 'bg-blue-100' : ''}`}
                                    onClick={() => {
                                        onAlignmentChange('right');
                                        setShowAlignOptions(false);
                                    }}
                                    title="Align Right"
                                >
                                    <Image
                                        src="/icons/alignRight.png"
                                        alt="Right"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextEditorToolbar;