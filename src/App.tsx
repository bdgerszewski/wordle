import './App.css'
import words from './words.json'
import React, { useState, FunctionComponent, useEffect } from "react";
import { CellDimension, Grid } from './components/Grid';
// import  from '@heroicons/react/solid'

type KeyboardProps = {
    keyMap: LowercaseAlphaMap;
    backspaceHandler: () => void;
    enterHandler: () => void;
    setGuess: (guess: LowercaseAlphaString) => void;
};

export type LowercaseAlphaString = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export type LowercaseAlphaMap = Record<LowercaseAlphaString, KeyProps>;
export type LowerOrEmptyString = LowercaseAlphaString | '';

export enum KeyColor {
    DefaultKey = "bg-gray-500",
    DefaultCell = "bg-black",
    NotPresent = "bg-gray-800",
    Present = "bg-yellow-400",
    Exact = "bg-green-700",
}

export type KeyProps = {
    color: KeyColor;
};

const lowerCaseAlphaKeyRows: LowercaseAlphaString[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
];
const Keyboard: FunctionComponent<KeyboardProps> = ({keyMap, backspaceHandler, enterHandler, setGuess}) => {
    const buttonBaseClass = "h-12 rounded font-letters text-base font-bold text-white transition duration-150 ease-in-out"
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
        <div className="flex w-full flex-col items-center justify-end mb-5">
            {buttons}
        </div>
    );
};

const Modal: FunctionComponent<{ message: string, onClick: () => void }> = ({ message, onClick }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
            <div className="fixed inset-0 bg-gray-800 opacity-50"></div>
            <div className="bg-white rounded-lg p-8 z-50 justify-center flex flex-col">
                <p className="text-lg font-bold">{message}</p>
                <button onClick={onClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mx-auto  flex-1">
                    Close
                </button>
            </div>
        </div>
    );
};
type HamburgerMenuProps = {
    setIsOpen: (isOpen: boolean) => void;
    wordLength: CellDimension;
    setWordLength: (wordLength: CellDimension) => void;
    numGuesses: CellDimension;
    setNumGuesses: (numGuesses: CellDimension) => void;
}

const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({setIsOpen, wordLength, setWordLength, numGuesses, setNumGuesses}) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div className="fixed inset-0 bg-gray-800 opacity-50"></div>
        <div className="bg-white rounded-lg p-8 z-50 justify-center flex flex-col">
            <h2>Word length</h2>
            <div className="grid grid-flow-col gap-3">
                {[4,5,6,7,8].map((length) => (
                <div key={`w${length}`} className="flex flex-col">
                    <input type="radio" id="option4" name="option" value={length} onChange={() => setWordLength(length as CellDimension)}/>
                    <label>{length}</label>
                </div>))}
            </div>
            <h2>Number of guesses</h2>
            <div className="grid grid-flow-col gap-3">
                {[4,5,6,7,8].map((length) => (
                <div key={`g${length}`} className="flex flex-col">
                    <input type="radio" id="option4" name="option" value={length} onChange={() => setNumGuesses(length as CellDimension)}/>
                    <label>{length}</label>
                </div>))}
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mx-auto  flex-1">
                Close
            </button>
        </div>
    </div>
    )
  }


const Home: FunctionComponent = () => {
    const [wordLength, setWordLength] = useState<CellDimension>(6);
    const [numGuesses, setNumGuesses] = useState<CellDimension>(6);
    const initKeyMap = lowerCaseAlphaKeyRows
        .flat()
        .reduce((map, char) => ({ ...map, [char]: {color: KeyColor.DefaultKey} }), {} as Record<LowercaseAlphaString, KeyProps>);
    const [keyMap, setKeyMap] = useState<Record<LowercaseAlphaString, KeyProps>>(initKeyMap);
    const [guess, setGuess] = useState<LowercaseAlphaString[]>([]);
    const [guesses, setGuesses] = useState<LowercaseAlphaString[][]>([]);
    const [wordList, setWordList] = useState<LowercaseAlphaString[]>([]);
    const [shakeState, setShakeState] = useState<string>('');
    const [done, setDone] = useState<boolean>(false);
    const [won, setWon] = useState<boolean>(false);
    const [word, setWord] = useState<LowercaseAlphaString>();
    const [playCount, setPlayCount] = useState<number>(0);
    const [showModal, setShowModal] = useState<boolean>(true);
    const [showHamburger, setShowHamburger] = useState<boolean>(false);
    const properLengthWords = words.filter(word => word.length == wordLength);
    useEffect(() => {
        setWordList(properLengthWords as LowercaseAlphaString[]);
        const w = properLengthWords[Math.floor(Math.random() * properLengthWords.length)] as LowercaseAlphaString;
        setWord(w)
        console.log(w)
    }, [playCount, wordLength]);
    useEffect(() => {
        document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + 'px')
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
            }
            setGuess([]);
        } else {
            setShakeState('animate-shake');
            setTimeout(() => setShakeState(''), 500);
        }
    }
    const setGuessSafe = (nextChar: LowercaseAlphaString) => {
        if (guess.length < wordLength) {
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

    const reset = () => {
        setGuess([]);
        setGuesses([]);
        setKeyMap(initKeyMap);
        setDone(false);
        setWon(false);
        setPlayCount((prev) => prev + 1);
        setShowModal(true)
    }
    const close = () => setShowModal(false);

    return (
        <>
            <main className="flex h-screen bg-black antialiased justify-center overflow-hidden">
                <div className="container flex flex-col items-center justify-between gap-12 max-w-2xl">
                    <div className="flex flex-row justify-between items-center w-full">
                        <button onClick={() => setShowHamburger(true)} className=" text-white text-3xl font-bold self-center ml-3 mt-3">
                            ⚙️
                        </button>
                        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem] font-letters mt-4 flex ">
                            Wordle++
                        </h1>
                        <div className="w-10"></div>
                    </div>
                    {showHamburger && <HamburgerMenu setIsOpen={setShowHamburger} wordLength={wordLength} setWordLength={setWordLength} numGuesses={numGuesses} setNumGuesses={setNumGuesses} />}
                    <Grid
                        numRows={numGuesses}
                        numCols={wordLength}
                        history={guesses}
                        current={guess}
                        word={word ? [...word] as LowercaseAlphaString[] : [] as LowercaseAlphaString[]}
                        shakeState={shakeState}
                    />
                    {done && <button onClick={reset} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mx-auto  flex-1">Play Again</button>}
                    <Keyboard keyMap={keyMap} backspaceHandler={backspace} enterHandler={enter} setGuess={setGuessSafe}/>
                </div>
                {done && showModal && <Modal message={won ? "You win!" : `You lose 😥 (The word was ${word})`} onClick={close} />}
            </main>
        </>
    );
};

export default Home;
