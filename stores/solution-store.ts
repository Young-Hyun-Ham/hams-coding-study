import { create } from "zustand";

const initialCode = `def solution(numbers):
    return sum(numbers)

print(solution([1, 2, 3, 4]))`;

type SolutionState = {
  code: string;
  stdin: string;
  setCode: (code: string) => void;
  setStdin: (stdin: string) => void;
  reset: () => void;
};

export const useSolutionStore = create<SolutionState>((set) => ({
  code: initialCode,
  stdin: "",
  setCode: (code) => set({ code }),
  setStdin: (stdin) => set({ stdin }),
  reset: () => set({ code: initialCode, stdin: "" }),
}));
