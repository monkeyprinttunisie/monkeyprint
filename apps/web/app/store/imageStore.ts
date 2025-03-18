import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ImageStore {
    images: string[];
    setImageUrl: (url: string) => void;
    addImage: (url: string) => void;
}
const useImageStore = create<ImageStore>()(
    persist(
        (set) => ({
            images: [],
            setImageUrl: (url: string) => set({ images: [url] }),
            addImage: (url: string) => set((state) => ({ images: [url, ...state.images] })),
        }),
        {
            name: 'image-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useImageStore;
