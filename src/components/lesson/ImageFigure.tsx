import Image from 'next/image'

export function ImageFigure({
  src,
  alt,
  caption,
  width = 1200,
  height = 700,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className="my-8">
      <Image src={src} alt={alt} width={width} height={height} className="rounded-md" />
      {caption && <figcaption className="mt-2 text-center text-sm text-pvj-navy/60">{caption}</figcaption>}
    </figure>
  )
}
