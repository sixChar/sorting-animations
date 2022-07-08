import logo from './logo.svg';
import './App.css';
import {useEffect, useState, useRef} from 'react'


const MIN_BAR_HEIGHT = 10;
const HIGHLIGHT_COLOR = "#DD0000";
const DEFAULT_REFRESH_DELAY = 50;


const SORT_FUNCS = [
  ['bubble sort', bubble_sort_step],
  ['insertion sort', insertion_sort_step],
  ['selection sort', selection_sort_step],
  ['merge sort', merge_sort_step],
  ['quicksort', quick_sort_step],
  ['radix sort', radix2_sort_step],
  ['cocktail shaker sort', cocktail_sort_step],
];
const DEFAULT_SORT_INDEX = 0;


const ARR_SIZES = [
  ['very small', 16],
  ['small', 32],
  ['medium', 64],
  ['large', 128],
  ['very large', 256]
];
const DEFAULT_SIZE_INDEX = 1;


const SPEEDS = [
  ['slow', 500],
  ['medium', 250],
  ['fast', 50]
];
const DEFAULT_SPEED_INDEX = 2;


function random_arr(size) {
  let idxs = Array.from({length: size}, (x,i)=>(i));

  const vals = Array.from({length: size}, ()=>0);

  for (let i = 0; i < vals.length; i++) {
    const j = Math.floor(Math.random() * idxs.length);
    vals[i] = idxs[j];
    idxs.splice(j,1);
  }
  return vals;
}   


function bubble_sort_step(sortData) {

  if (sortData.nextComp === undefined) {
    sortData.nextComp = 0;
    sortData.maxComp = sortData.arr.length;
  }

  let newArr = [...sortData.arr];
  let nextComp = sortData.nextComp;
  let maxComp = sortData.maxComp;

  if (newArr[nextComp] > newArr[nextComp+1]) {
    const temp = newArr[nextComp];
    newArr[nextComp] = newArr[nextComp+1];
    newArr[nextComp + 1] = temp;
  }
  nextComp++;

  if (nextComp + 1 >= maxComp) {
    maxComp--;
    nextComp = 0;
  }

  return {
    ...sortData,
    arr: newArr,
    highlighted: [nextComp, nextComp+1],
    nextComp: nextComp,
    maxComp: maxComp,
    done: maxComp == 1,
  };
}


function insertion_sort_step(sortData) {
  if (!sortData.numSorted) {
    sortData.numSorted = 1;
    sortData.toInsert = 1;
    sortData.checkIndex = 0;
  }



  let newArr = [...sortData.arr];
  let checkIndex = sortData.checkIndex;
  let toInsert = sortData.toInsert;
  let numSorted = sortData.numSorted;

  if (checkIndex >= numSorted) {
    toInsert += 1;
    checkIndex = 0;
    numSorted += 1;
  }
  else if (newArr[checkIndex] > newArr[toInsert]) {
    const insertVal = newArr.splice(toInsert, 1)[0];
    newArr.splice(checkIndex,0,insertVal);
    toInsert += 1;
    checkIndex = 0;
    numSorted += 1;
  }
  else {
    checkIndex += 1;
  }


  return {
    ...sortData,
    arr: newArr,
    numSorted: numSorted,
    toInsert: toInsert,
    checkIndex: checkIndex,
    highlighted: [checkIndex, toInsert],
    done: numSorted >= newArr.length,
  };
}


function selection_sort_step(sortData) {

  if (sortData.numSorted === undefined) {
    sortData.numSorted = 0;
    sortData.currSmallest = 0;
    sortData.compIndex = 1;
  }

  let newArr = [...sortData.arr];
  let numSorted = sortData.numSorted;
  let currSmallest = sortData.currSmallest;
  let compIndex = sortData.compIndex;

  if (newArr[compIndex] < newArr[currSmallest]) {
    currSmallest = compIndex;
  }
  compIndex += 1;

  if (compIndex >= newArr.length) {
    
    const temp = newArr[currSmallest];
    newArr[currSmallest] = newArr[numSorted];
    newArr[numSorted] = temp;

    numSorted += 1;
    currSmallest = numSorted;
    compIndex = numSorted + 1;
  }



  return {
    ...sortData,
    arr: newArr,

    numSorted: numSorted,
    currSmallest: currSmallest,
    compIndex: compIndex,

    highlighted: [compIndex, currSmallest],
    done: numSorted >= newArr.length,
  };
}



function merge_sort_step(sortData) {
  // Initialize
  if (sortData.mergeSize === undefined) {
    sortData.mergeSize = 1;
    sortData.mergeStart = 0;
    sortData.indx1 = sortData.mergeStart;
    sortData.indx2 = sortData.mergeStart + sortData.mergeSize;
    sortData.highlighted = [sortData.indx1, sortData.indx2];
    return sortData;
  }

  let newArr = sortData.arr;
  let mergeSize = sortData.mergeSize;
  let mergeStart = sortData.mergeStart;
  let indx1 = sortData.indx1;
  let indx2 = sortData.indx2;

  if (newArr[indx1] < newArr[indx2]) {
    indx1 += 1;
  }
  else {
    const temp = newArr.splice(indx2, 1)[0];
    newArr.splice(indx1, 0, temp);
    indx1 += 1;
    indx2 += 1;
  }

  // Check if finished merging current two sub arrays
  if (indx2 >= mergeStart + 2 * mergeSize || 
      indx2 >= newArr.length ||
      indx1 >= indx2) {
    mergeStart += mergeSize * 2;
    indx1 = mergeStart;
    indx2 = Math.min(mergeStart + mergeSize, newArr.length-1);
  }

  // Check if finished merging all subarrays of this size
  if (indx1 >= newArr.length) {
    mergeStart = 0;
    mergeSize = mergeSize * 2;
    indx1 = mergeStart;
    indx2 = mergeStart + mergeSize;
  }

  return {
    ...sortData,
    arr: newArr,
    mergeSize: mergeSize,
    mergeStart: mergeStart,
    indx1: indx1,
    indx2: indx2,
    highlighted: [indx1, indx2],
    done: mergeSize >= newArr.length, 
  }
}


function quick_sort_step(sortData) {
  //initialize
  if (sortData.stack === undefined) {
    sortData.stack = [];
    sortData.start = 0;
    sortData.end = sortData.arr.length;
    sortData.pivot = 0;
    sortData.nextCheck = 1;
    sortData.nextLowInsert = 0;
  }

  let newArr = [...sortData.arr];
  let stack = [...sortData.stack];
  let start = sortData.start;
  let end = sortData.end;
  let pivot = sortData.pivot;
  let nextCheck = sortData.nextCheck;
  let nextLowInsert = sortData.nextLowInsert;
  let done = false;

  //Pivot starts at start and then insert before or after

  if (newArr[nextCheck] < newArr[pivot]) {
    //insert before pivot
    const temp = newArr.splice(nextCheck, 1)[0];
    newArr.splice(pivot, 0, temp);
    pivot++;
  }
  else {
    const temp = newArr.splice(nextCheck, 1)[0];
    newArr.splice(pivot+1, 0, temp); 
  }
  nextCheck++;

  if (nextCheck >= end) {
    if (end - start > 1) {
      stack.push([pivot+1, end]);
      start = start;
      end = pivot;
    }
    else if (stack.length > 0) {
      start = -1;
      end = -1;
      while (stack.length > 0 && end - start <= 1) {
        [start, end] = stack.pop();
      }
      // if stack empty and end - start still less than zero that means we're done
      if (stack.length <= 0 && end - start <=1) {
        done = true;
      }
    }
    else {
      done = true;
    }
    pivot = start;
    nextCheck = start+1;
  }

  return {
    ...sortData,
    arr: newArr,
    highlighted: [pivot, nextCheck],
    stack: stack,
    start: start,
    end: end,
    pivot: pivot,
    nextCheck: nextCheck,
    done: done,
  };

}


function radix2_sort_step(sortData) {
  //initialize
  if (sortData.quotient === undefined) {
    sortData.highStart = 0;
    sortData.nextCheck = 0;
    sortData.quotient = 1;
  }
  
  let newArr = [...sortData.arr];
  let highStart = sortData.highStart;
  let nextCheck = sortData.nextCheck;
  let quotient = sortData.quotient;

  if (Math.floor(newArr[nextCheck] / quotient) % 2 == 0) {
    const temp = newArr.splice(nextCheck, 1)[0];
    newArr.splice(highStart, 0, temp);
    highStart++;
  }
  nextCheck++;
  
  if (nextCheck >= newArr.length) {
    quotient = quotient * 2;
    nextCheck = 0;
    highStart = 0;
  }

  return {
    ...sortData,
    arr: newArr,
    highlighted: [nextCheck],
    highStart: highStart,
    nextCheck: nextCheck,
    quotient: quotient,
    done: quotient >= newArr.length,
  } 
}


function cocktail_sort_step(sortData) {
  if (sortData.minCheck === undefined) {
    sortData.minCheck = -1;
    sortData.maxCheck = sortData.arr.length;
    sortData.nextCheck = 0;
    sortData.increasing = true;
    sortData.hadToSwap = false;
  }

  let newArr = sortData.arr;
  let minCheck = sortData.minCheck; 
  let maxCheck = sortData.maxCheck; 
  let nextCheck = sortData.nextCheck; 
  let increasing = sortData.increasing; 
  let hadToSwap = sortData.hadToSwap;
  let done = false;

  if (increasing) {
    if (newArr[nextCheck] > newArr[nextCheck + 1]) {
      const temp = newArr[nextCheck];
      newArr[nextCheck] = newArr[nextCheck + 1];
      newArr[nextCheck + 1] = temp;
      hadToSwap = true;
    }
    nextCheck++;
  }
  else {
    if (newArr[nextCheck] <= newArr[nextCheck-1]) {
      const temp = newArr[nextCheck];
      newArr[nextCheck] = newArr[nextCheck-1];
      newArr[nextCheck-1] = temp;
      hadToSwap = true;
    }
    nextCheck--;
  }

  if (increasing && nextCheck+1 >= maxCheck) {
    maxCheck--;
    increasing=false;
    nextCheck=maxCheck-1;
    if (!hadToSwap) {
      done=true;
    }
    hadToSwap = false;
  }
  else if (!increasing && nextCheck-1 <= minCheck) {
    minCheck++;
    increasing=true;
    nextCheck=minCheck+1;
    if (!hadToSwap) {
      done=true;
    }
    hadToSwap=false;
  }

  return {
    ...sortData,
    arr:newArr,
    highlighted: increasing ? [nextCheck, nextCheck+1] : [nextCheck, nextCheck-1],
    minCheck:minCheck,
    maxCheck: maxCheck,
    nextCheck: nextCheck,
    increasing: increasing,
    hadToSwap: hadToSwap,
    done: done,
  };

}



const ArrayDisplay = (props) => {

  const barWidth = props.width / props.arr.length - 1;
  const maxVal = Math.max(...props.arr);
  const minVal = Math.min(...props.arr);
  const barHeight = (props.height-MIN_BAR_HEIGHT) / (maxVal - minVal);

  
  const bars = props.arr.map((x,i)=>(
    <div key={i + ' ' + x} style={{
      background: props.highlighted && props.highlighted?.indexOf(i) !== -1 ? HIGHLIGHT_COLOR : 'white',
      position:'absolute',
      bottom: '0',
      left: i*(barWidth+1) + 'px', 
      width: barWidth + 'px',
      height: (props.arr[i]-minVal) * barHeight + MIN_BAR_HEIGHT + 'px',
    }} />
  ));

  return (
    <div style={{
      background:'black',
      border: '2px solid black',
      position: 'relative',
      width: props.width,
      height: props.height,
    }}>
      {bars}
    </div>
  );
}


const SortAnimation = (props) => {

  const [currHigh, setCurrHigh] = useState([]);
  const [arr, setArr] = useState(random_arr(props.arrSize));

  const sortDataRef = useRef({
    arr,
    highlighted:[],
  });
  const refreshDelayRef = useRef(props.refreshDelay || SPEEDS[DEFAULT_SPEED_INDEX][1]);


  useEffect(()=>{
    if (sortDataRef.current.arr === null) {
      sortDataRef.current.arr = random_arr(props.arrSize);
    }
    const sortFunc = SORT_FUNCS[props.sortFuncIdx][1];
    let timeout = null;
    const sortStep = () => {
      sortDataRef.current = sortFunc(sortDataRef.current);
      setArr(sortDataRef.current.arr);

      if (!sortDataRef.current.done) {
        setCurrHigh(sortDataRef.current.highlighted);
        timeout = setTimeout(sortStep, refreshDelayRef.current);
      }
      else {
        setCurrHigh([]);
      }
    }

    timeout = setTimeout(sortStep, refreshDelayRef.current);

    return (()=>{
      clearInterval(timeout);
      sortDataRef.current = {arr:null, highlighted:[]};
    });
    
  }, [props.sortFuncIdx, props.arrSize]);

  useEffect(()=>{
    refreshDelayRef.current = props.refreshDelay;
  }, [props.refreshDelay]);

  
  return (
    <ArrayDisplay width={props.width} height={props.height} arr={arr} highlighted={currHigh}/>
  );
}


const Selector = (props) =>{
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      background: 'white',
      borderRadius: '10px',
      border: '5px solid white',
    }}>
      <label htmlFor={props.label}>{props.label}</label>
      <select id={props.label} defaultValue={props.defaultValue} onChange={props.onChange}>
        {props.options.map(([name,value],i)=>(
          <option key={name} value={props.indexAsVal ? i : value}>{name}</option>
        ))}  
      </select>
    </div>
  );
}



function App() {

  const [sortFuncIdx, setSortFuncIdx] = useState(0);
  const [arrSize, setArrSize] = useState(ARR_SIZES[DEFAULT_SIZE_INDEX][1]);
  const [speed, setSpeed] = useState(SPEEDS[DEFAULT_SPEED_INDEX][1]);
  const [aniHeight, setAniHeight] = useState(null);

  const selectorsRef = useRef(null);

  useEffect(()=>{
    let sortData = {arr: random_arr(10)};
    console.log(sortData);
    sortData = cocktail_sort_step(sortData);
    console.log(sortData);
    
  },[]);

  useEffect(()=>{
    if (selectorsRef.current) {
      const selHeight = selectorsRef.current.clientHeight;
      // innerheight - selectors height - 10px from flex gap - 10px from margin - 10px so the bottom doesn't touch end of screen
      const newAniHeight = window.innerHeight - selHeight - 10 - 10 - 10;
      if (newAniHeight != aniHeight) {
        setAniHeight(newAniHeight);
      }
    } 
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      height: '100vh',
      background:'black',
    }}>
      <div style={{marginTop:'10px'}}>
        <SortAnimation 
          width={Math.min(480, window.innerWidth - 10)} 
          height={aniHeight || Math.min(540, Math.floor(window.innerHeight * .8))} 
          sortFuncIdx={sortFuncIdx || DEFAULT_SORT_INDEX}
          arrSize={arrSize}
          refreshDelay={speed}
        />
      </div>


      <div ref={selectorsRef} style={{
        display:'flex',
        direction:'row',
        gap: '20px',
        flexBasis: 'auto',
      }}>

        <Selector
          label="Algorithm"
          options={SORT_FUNCS}
          onChange={(e)=>setSortFuncIdx(e.target.value)}
          indexAsVal          
        />

        <Selector 
          label="Array Size" 
          options={ARR_SIZES} 
          onChange={(e)=>{
            setArrSize(e.target.value)
          }}
          defaultValue={ARR_SIZES[DEFAULT_SIZE_INDEX][1]}
        />

        <Selector
          label="Speed"
          options={SPEEDS}
          onChange={(e)=>{setSpeed(e.target.value)}}
          defaultValue={SPEEDS[DEFAULT_SPEED_INDEX][1]}
        />

      </div>
    </div>
  );
}

export default App;
