import './App.css'
import words from './words.json'
import React, { useState, FunctionComponent, useEffect } from "react";


type LowercaseAlphaString = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type LowercaseAlphaMap = Record<LowercaseAlphaString, KeyProps>;
type LowerOrEmptyString = LowercaseAlphaString | '';


type CellProps = {
    value: LowerOrEmptyString;
    bgColor?: string;
    isCurrent: boolean;
    shakeState: string;
};
type GridProps = {
    numRows: number;
    numCols: number;
    history: LowercaseAlphaString[][];
    current: LowercaseAlphaString[];
    word: LowercaseAlphaString[];
    shakeState: string;
};
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
    console.log({word, guess, index, occurencesOfCharInWord, occurencesOfCharInGuess, numExactMatches, numYellowsToShow})
    guess.forEach((char, i) => {
        if (char === guess[index] && word.includes(char) && char !== word[i]) {
            yellowIndices.push(i);
        }
    })
    const yellowIndicesToShow = yellowIndices.slice(0, numYellowsToShow);
    console.log({yellowIndices, yellowIndicesToShow})
    if (word[index] === guess[index]) {
        return KeyColor.Exact;
    } else if (yellowIndicesToShow.includes(index)) {
        return KeyColor.Present;
    } else {
        return KeyColor.DefaultCell;
    }
}

const Grid: FunctionComponent<GridProps> = ({ numRows, numCols, history, current, word, shakeState }) => {
    const grid = [];
    const values = [...history, current];
    for (let r = 0; r < numRows; ++r) {
        const row = [];
        for (let c = 0; c < numCols; ++c) {
            row.push(
                <Cell key={`${r}-${c}`} value={values[r]?.[c] ?? ''} bgColor={r+1 == values.length ? KeyColor.DefaultCell : getColor(word, values[r], c) } shakeState={shakeState} isCurrent={r+1 == values.length}/>
            );
        }
        grid.push(row);
    }

    return <div className={`grid grid-cols-5 grid-rows-6 gap-1.5 justify-end`}>{grid}</div>
};

enum KeyColor {
    DefaultKey = "bg-gray-500",
    DefaultCell = "bg-black",
    NotPresent = "bg-gray-800",
    Present = "bg-yellow-400",
    Exact = "bg-green-700",
}

type KeyProps = {
    color: KeyColor;
};

type KeyboardProps = {
    keyMap: LowercaseAlphaMap;
    keyMapUpdater: (char: LowercaseAlphaString, color: KeyColor) => void;
    backspaceHandler: () => void;
    enterHandler: () => void;
    setGuess: (guess: LowercaseAlphaString) => void;
  };

const lowerCaseAlphaKeyRows: LowercaseAlphaString[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];
const Keyboard: FunctionComponent<KeyboardProps> = ({keyMap, keyMapUpdater, backspaceHandler, enterHandler, setGuess}) => {
    // import a file from the resources folder named words.txt
    const buttonBaseClass = "h-14 rounded font-letters text-base font-bold text-white transition duration-150 ease-in-out"
    const backButton = (
        <button key={'back'} className={`flex-1.5 text-4xl ${KeyColor.DefaultKey} mr-1.5 ${buttonBaseClass}`} onClick={backspaceHandler}>
            ←
        </button>
    )
    const enterButton = (
        <button key={'enter'} className={`flex-1.5 text-sm mr-1.5 w-op-key ${KeyColor.DefaultKey} ${buttonBaseClass}`} onClick={enterHandler}>
            ENTER
        </button>
    )
    const extras: Record<number, JSX.Element[] | null[]> = {0: [null,null], 1: [(<div key="spacer-0" className="flex-0.5"></div>),(<div key="spacer-1" className="flex-0.5"></div>)], 2: [enterButton, backButton]}
    const buttons: JSX.Element[] = lowerCaseAlphaKeyRows.map((row, i) => (
        <div key={i} className="flex justify-center w-full mb-1.5 ml-1.5">
            {[extras[i][0], ...row.map((char, j) => (
                <button
                    key={char}
                    className={`flex-1 ${["pl"].includes(char) ? "" : "mr-1.5"} w-letter-key ${keyMap[char].color} ${buttonBaseClass}`}
                    onClick={() => {
                        setGuess(char)
                    }}
                >
                    {char.toUpperCase()}
                </button>
            )), extras[i][1]]}
        </div>
    ))

    return (
        <div className="flex w-full flex-col items-center justify-end ">
            {buttons}
        </div>
    );
};

const Modal: FunctionComponent<{message: string}> = ({ message }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-800 opacity-75"></div>
        <div className="bg-white rounded-lg p-8 z-50">
          <p className="text-lg font-bold">{message}</p>
        </div>
      </div>
    );
  };


const Home: FunctionComponent = () => {
    const wordLength = 5;
    const numGuesses = 6;
    
    const [keyMap, setKeyMap] = useState<Record<LowercaseAlphaString, KeyProps>>(lowerCaseAlphaKeyRows
        .flat()
        .reduce((map, char) => ({ ...map, [char]: {color: KeyColor.DefaultKey} }), {} as Record<LowercaseAlphaString, KeyProps>)
    );
    const [guess, setGuess] = useState<LowercaseAlphaString[]>([]);
    const [guesses, setGuesses] = useState<LowercaseAlphaString[][]>([]);
    const [wordList, setWordList] = useState<LowercaseAlphaString[]>([]);
    const [shakeState, setShakeState] = useState<string>('');
    const [done, setDone] = useState<boolean>(false);
    const [won, setWon] = useState<boolean>(false);
    const [word, setWord] = useState<LowercaseAlphaString>();
    const properLengthWords = words.filter(word => word.length == wordLength);
    useEffect(() => {
        setWordList(properLengthWords as LowercaseAlphaString[]);
        const w = properLengthWords[Math.floor(Math.random() * properLengthWords.length)] as LowercaseAlphaString;
        setWord(w)
        console.log(w)
    }, []);
    const submitGuess = (guess: LowercaseAlphaString[]) => {
        setGuesses((prev) => [...prev, guess]);
        guess.forEach((char: LowercaseAlphaString, i: number) => {
            if (char == word?.[i]) {
                updateKeyInMap(char, KeyColor.Exact);
            } else if (word?.includes(char)) {
                updateKeyInMap(char, KeyColor.Present);
            } else {
                updateKeyInMap(char, KeyColor.NotPresent);
            }
        })
    }
    const backspace = () => setGuess((prev) => prev.slice(0, -1));
    const enter = () => {
        if (guess.length == wordLength && wordList.includes(guess.join('') as LowercaseAlphaString)) {
            submitGuess(guess);
            if (guesses.length == numGuesses - 1 || guess.join('') == word) {
                setDone(true);
                if (guess.join('') == word) {
                    setWon(true);
                }
            } else {
                setGuess([]);
            }
        } else {
            setShakeState('animate-shake');
            setTimeout(() => setShakeState(''), 500);
        }
    }
    const setGuessSafe = (nextChar: LowercaseAlphaString) => {
        if (guess.length <= wordLength) {
            setGuess((prev) => [...prev, nextChar]);
        }
    }

    const updateKeyInMap = (char: LowercaseAlphaString, color: KeyColor) => {
        setKeyMap((prev: Record<LowercaseAlphaString, KeyProps>) => {
            const curColor: KeyColor = prev[char].color;
            const nextColor = curColor == KeyColor.Exact ? KeyColor.Exact : color;
            return ({ ...prev, [char]: {color: nextColor} })
        })
    }


    return (
        <>
            {/* <Head>
                <title>{"Ben's Wordle Clone"}</title>
                <meta name="description" content="WIP" />
                <link rel="icon" href="/favicon.ico" />
            </Head> */}
            <main className="flex min-h-screen bg-black antialiased">
                <div className="container flex flex-col items-center justify-between gap-12 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem] font-letters mt-4">
                        Wordle?
                    </h1>
                    <Grid
                        numRows={numGuesses}
                        numCols={wordLength}
                        history={guesses}
                        current={guess}
                        word={word ? [...word] as LowercaseAlphaString[] : [] as LowercaseAlphaString[]}
                        shakeState={shakeState}
                    />
                    <Keyboard keyMap={keyMap} keyMapUpdater={updateKeyInMap} backspaceHandler={backspace} enterHandler={enter} setGuess={setGuessSafe}/>
                </div>
                {done && <Modal message={won ? "You win!" : `You lose 😥 (The word was ${word})`} />}
            </main>
        </>
    );
};

export default Home;
