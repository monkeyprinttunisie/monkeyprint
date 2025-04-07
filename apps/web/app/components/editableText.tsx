"use client";
import { useRef, useEffect } from "react";

interface EditableTextProps {
    text: {
        content: string;
        position: { x: number; y: number };
        size: number;
        rotation: number;
        fontFamily: string;
        color: string;
        isBold: boolean;
        alignment: 'left' | 'center' | 'right';
        isSelected: boolean;
        zoneId: string;
    };
    isEditing: boolean;
    onChange: (content: string) => void;
    onDelete: () => void;
    onResize: (e: React.MouseEvent) => void;
    onResizeTouchStart: (e: React.TouchEvent) => void;
}

const EditableText: React.FC<EditableTextProps> = ({
    text,
    isEditing,
    onChange,
    onDelete,
    onResize,
    onResizeTouchStart,
}) => {
    const textInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select();
        }
    }, [isEditing]);

    return (
        <>
            {isEditing ? (
                <textarea
                    ref={textInputRef}
                    value={text.content}
                    onChange={(e) => onChange(e.target.value)}
                    className=" bg-[#509CFE]/20 outline-none resize-none  border-l-2 border-r-2 border-[#509CFE]"
                    style={{
                        fontFamily: text.fontFamily,
                        fontSize: `${text.size}px`,
                        color: text.color,

                        fontWeight: text.isBold ? '700' : '500',
                        textAlign: text.alignment,
                        minWidth: 'min(200px, 15vw)',
                        minHeight: '2.5vh',
                        maxWidth: '33vw',
                        overflow: 'hidden',
                        width: 'auto'

                    }}
                />
            ) : (
                <div
                    style={{
                        fontFamily: text.fontFamily,
                        fontSize: `${text.size}px`,
                        color: text.color,
                        fontWeight: text.isBold ? '700' : '500',
                        textAlign: text.alignment,
                        minWidth: '100px'
                    }}
                >
                    {text.content}
                </div>
            )}

            {/* Control handles for selected text */}
            {text.isSelected && (
                <>
                    {/* Resize handle */}
                    <div
                        className="absolute  bg-blue-500  h-5 w-5 rounded-full right-0 bottom-0 cursor-se-resize transform translate-x-1/2 translate-y-1/2  flex items-center justify-center"
                        onMouseDown={onResize}
                        onTouchStart={onResizeTouchStart}
                    >
                        <img src="/icons/resize.svg" alt="Resize" width="20" height="20" />
                    </div>



                    {/* Remove button */}
                    <div
                        className="absolute   bg-blue-500  h-5 w-5 rounded-full left-0 top-0 cursor-pointer  flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                        onClick={onDelete}
                    >
                        <img src="/icons/close.svg" alt="Resize" width="10" height="10" />
                    </div>
                </>
            )}
        </>
    );
};

export default EditableText;