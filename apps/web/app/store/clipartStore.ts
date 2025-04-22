import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Clipart {
    id: string
    imageUrl: string
    category: string
    isFree: boolean
}

interface ClipartStore {
    cliparts: Clipart[]
    selectedClipartIds: string[]
    setCliparts: (cliparts: Clipart[]) => void
    toggleSelectClipart: (id: string) => void
    clearSelection: () => void
    getSelectedCliparts: () => Clipart[]
}

const useClipartStore = create<ClipartStore>()(
    persist(
        (set, get) => ({
            cliparts: [
                {
                    id: "1",
                    imageUrl: "/images/clipart_1.png",
                    category: "anime",
                    isFree: true,
                },
                {
                    id: "2",
                    imageUrl: "/images/clipart_2.png",
                    category: "anime",
                    isFree: true,
                },
                {
                    id: "3",
                    imageUrl: "/images/clipart_3.png",
                    category: "fantasy",
                    isFree: true,
                },
                {
                    id: "4",
                    imageUrl: "/images/clipart_4.png",
                    category: "fantasy",
                    isFree: true,
                },
                {
                    id: "5",
                    imageUrl: "/images/clipart_5.png",
                    category: "anime",
                    isFree: true,
                },
                {
                    id: "6",
                    imageUrl: "/images/clipart_6.png",
                    category: "fantasy",
                    isFree: true,
                },
            ],
            selectedClipartIds: [],
            setCliparts: (cliparts) => set({ cliparts }),
            toggleSelectClipart: (id) =>
                set((state) => ({
                    selectedClipartIds: state.selectedClipartIds.includes(id)
                        ? state.selectedClipartIds.filter((clipartId) => clipartId !== id)
                        : [...state.selectedClipartIds, id],
                })),
            clearSelection: () => set({ selectedClipartIds: [] }),
            getSelectedCliparts: () => {
                const { cliparts, selectedClipartIds } = get()
                return cliparts.filter((clipart) => selectedClipartIds.includes(clipart.id))
            },
        }),
        {
            name: "clipart-storage",
        },
    ),
)

export default useClipartStore
