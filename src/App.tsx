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
    if (word[index] === guess[index]) {
        return KeyColor.Exact;
    } else if (word.includes(guess[index] as LowercaseAlphaString)) {
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

    return <div className={`grid grid-cols-5 grid-rows-6 gap-1.5`}>{grid}</div>;
};

enum KeyColor {
    DefaultKey = "bg-gray-400",
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
    const buttonBaseClass = "h-14 rounded font-mono text-lg font-semibold text-white transition duration-150 ease-in-out"
    const backButton = (
        <button key={'back'} className={`flex-1.5 bg-gray-400 ${buttonBaseClass}`} onClick={backspaceHandler}>
            ←
        </button>
    )
    const enterButton = (
        <button key={'enter'} className={`flex-1.5 mr-1.5 w-op-key bg-gray-400 ${buttonBaseClass}`} onClick={enterHandler}>
            ENTER
        </button>
    )
    const buttons: JSX.Element[] = lowerCaseAlphaKeyRows.map((row, i) => (
        <div key={i} className="flex justify-center w-full mb-1.5">
            {[i == 2 ? enterButton : null, ...row.map((char, j) => (
                <button
                    key={char}
                    className={`flex-1 ${["pl"].includes(char) ? "" : "mr-1.5"} w-letter-key ${keyMap[char].color} ${buttonBaseClass}`}
                    onClick={() => {
                        setGuess(char)
                    }}
                >
                    {char.toUpperCase()}
                </button>
            )), i == 2 ? backButton : null]}
        </div>
    ))

    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
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
      setWord(properLengthWords[Math.floor(Math.random() * properLengthWords.length)] as LowercaseAlphaString)
    }, []);
    console.log(word)
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
            console.log(char, curColor)
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
            <main className="flex min-h-screen items-center justify-center bg-black antialiased">
                <div className="container flex flex-col items-center  gap-12 ">
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
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
                {done && <Modal message={won ? "You win!" : "You lose 😥"} />}
            </main>
        </>
    );
};

export default Home;
