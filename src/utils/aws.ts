export const getS3PathURL = ({
  objectName,
}: {
  objectName: string
}): string => {
  return `${process.env.R2_PUBLIC_URL}/${objectName}`
}

export const getS3ObjectName = (url: string): string => {
  const path = new URL(url).pathname.slice(1)

  return path
}
