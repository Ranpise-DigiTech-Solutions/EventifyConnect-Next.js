export function SortCardsBasedOnAvailability(arr: Array<any>): Array<any> {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  return mergeSort(
    SortCardsBasedOnAvailability(left),
    SortCardsBasedOnAvailability(right)
  );
}

function mergeSort(left: Array<any>, right: Array<any>): Array<any> {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (
      left[leftIndex].availability === "AVAILABLE" &&
      right[rightIndex].availability !== "AVAILABLE"
    ) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else if (
      left[leftIndex].availability !== "AVAILABLE" &&
      right[rightIndex].availability === "AVAILABLE"
    ) {
      result.push(right[rightIndex]);
      rightIndex++;
    } else if (
      left[leftIndex].availability === "LIMITED AVAILABILITY" &&
      right[rightIndex].availability === "UNAVAILABLE"
    ) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
