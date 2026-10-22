"use client";

import { isEstimable, type BucketId } from "@/domain/catalog/buckets";
import { useAppSelector } from "@/store/hooks";
import { selectIsEstimated } from "../selectors";
import { ChipPicker } from "./ChipPicker";
import { EstimateRow } from "./EstimateRow";
import { EstimateToggle } from "./EstimateToggle";
import { ItemSearch } from "./ItemSearch";
import { PickedPanel } from "./PickedPanel";

/** The body of a bucket step, between its heading and the nav. */
export function BucketStep({ bucket }: { bucket: BucketId }) {
  const estimated = useAppSelector(
    (state) => isEstimable(bucket) && selectIsEstimated(state, bucket),
  );

  return (
    <>
      {isEstimable(bucket) && <EstimateToggle bucket={bucket} />}
      {estimated && isEstimable(bucket) ? (
        <EstimateRow bucket={bucket} />
      ) : (
        <>
          <PickedPanel bucket={bucket} />
          <ChipPicker bucket={bucket} />
          <ItemSearch bucket={bucket} />
        </>
      )}
    </>
  );
}
