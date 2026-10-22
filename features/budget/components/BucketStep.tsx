import type { BucketId } from "@/domain/catalog/buckets";
import { ChipPicker } from "./ChipPicker";
import { PickedPanel } from "./PickedPanel";

/** The body of a bucket step, between its heading and the nav (Spec §4.3). */
export function BucketStep({ bucket }: { bucket: BucketId }) {
  return (
    <>
      <PickedPanel bucket={bucket} />
      <ChipPicker bucket={bucket} />
    </>
  );
}
