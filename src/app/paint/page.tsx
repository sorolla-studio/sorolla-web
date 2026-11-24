import { notFound } from "next/navigation";
import PaintTable from "./PaintTable";

/** Dev only: draws the pictures and masks that scripts/paint.mjs saves into public/paint. */
export default function Paint() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PaintTable />;
}
