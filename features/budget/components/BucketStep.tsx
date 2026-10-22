"use client";

import {
  isEstimable,
  type BucketId,
  type EstimableBucketId,
} from "@/domain/catalog/buckets";
import { useAppSelector } from "@/store/hooks";
import { selectIsEstimated } from "../selectors";
import { ChipPicker } from "./ChipPicker";
import { EstimateRow } from "./EstimateRow";
import { EstimateToggle } from "./EstimateToggle";
import { ItemSearch } from "./ItemSearch";
import { PickedPanel } from "./PickedPanel";

/** The body of a bucket step, between its heading and the nav. */
export function BucketStep({ bucket }: { bucket: BucketId }) {
  return isEstimable(bucket) ? (
    <EstimableBucket bucket={bucket} />
  ) : (
    <ItemizedBucket bucket={bucket} />
  );
}

/** The rough-total switch, then either the rough total or the items. */
function EstimableBucket({ bucket }: { bucket: EstimableBucketId }) {
  const estimated = useAppSelector((state) => selectIsEstimated(state, bucket));
  return (
    <>
      <EstimateToggle bucket={bucket} />
      {estimated ? (
        <EstimateRow bucket={bucket} />
      ) : (
        <ItemizedBucket bucket={bucket} />
      )}
    </>
  );
}

/** The picked rows, then the chips and search to pick more. */
function ItemizedBucket({ bucket }: { bucket: BucketId }) {
  return (
    <>
      <PickedPanel bucket={bucket} />
      <ChipPicker bucket={bucket} />
      <ItemSearch bucket={bucket} />
    </>
  );
}
