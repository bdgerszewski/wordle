import React, { FunctionComponent } from "react";
import { KeyColor, LowercaseAlphaString, LowerOrEmptyString } from "../App";

type CellProps = {
    value: LowerOrEmptyString;
    bgColor?: string;
    isCurrent: boolean;
    shakeState: string;
};
type GridProps = {
    numRows: CellDimension;
    numCols: CellDimension;
    history: LowercaseAlphaString[][];
    current: LowercaseAlphaString[];
    word: LowercaseAlphaString[];
    shakeState: string;
};
const rowOptions: Record<CellDimension, string> = {
    4: 'grid-rows-4',
    5: 'grid-rows-5',
    6: 'grid-rows-6',
    7: 'grid-rows-7',
    8: 'grid-rows-8',
}
// with the following map of number of columns to tailwind css class
const colOptions: Record<CellDimension, string> = {
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
}
// create a typescript type or enum that ensures the number of columns is valid
export type CellDimension = 4 | 5 | 6 | 7 | 8;
const Cell: FunctionComponent<CellProps> = ({ value, bgColor, isCurrent, shakeState }) => {
    const animation = isCurrent ? shakeState : '';
    return (
        <div
            className={`${bgColor} flex h-14 w-14 cursor-default select-none items-center justify-center border border-gray-600 text-3xl font-bold text-white ${animation}`}
        >
            {value.toUpperCase()}
        </div>
    );
};
const getColor = (word: LowercaseAlphaString[], guess: LowercaseAlphaString[] | undefined, index: number) => {
    if (!guess) {
        return KeyColor.DefaultCell;
    }
    const occurencesOfCharInWord = word.filter((char) => char === guess[index]).length;
    const occurencesOfCharInGuess = guess.filter((char) => char === guess[index]).length;
    const numExactMatches = word.filter((char, i) => char === guess[i] && guess[i] === guess[index]).length;
    const numYellowsToShow = Math.min(occurencesOfCharInWord, occurencesOfCharInGuess) - numExactMatches;
    const yellowIndices: number[] = [];
    guess.forEach((char, i) => {
        if (char === guess[index] && word.includes(char) && char !== word[i]) {
            yellowIndices.push(i);
        }
    });
    const yellowIndicesToShow = yellowIndices.slice(0, numYellowsToShow);
    if (word[index] === guess[index]) {
        return KeyColor.Exact;
    } else if (yellowIndicesToShow.includes(index)) {
        return KeyColor.Present;
    } else {
        return KeyColor.DefaultKey;
    }
};
export const Grid: FunctionComponent<GridProps> = ({ numRows, numCols, history, current, word, shakeState }) => {
    const grid = [];
    const values = [...history, current];
    for (let r = 0; r < numRows; ++r) {
        const row = [];
        for (let c = 0; c < numCols; ++c) {
            row.push(
                <Cell key={`${r}-${c}`} value={values[r]?.[c] ?? ''} bgColor={r + 1 == values.length ? KeyColor.DefaultCell : getColor(word, values[r], c)} shakeState={shakeState} isCurrent={r + 1 == values.length} />
            );
        }
        grid.push(row);
    }

    return <div className={`grid ${colOptions[numCols]} ${rowOptions[numRows]} gap-1.5 justify-end w-max`}>{grid}</div>;
};
