const MAX_FILENAME_LENGTH = 24;

export function truncateFilename(filename: string, maxLength = MAX_FILENAME_LENGTH): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  const dotIndex = filename.lastIndexOf(".");
  const hasExtension = dotIndex > 0 && dotIndex < filename.length - 1;
  const extension = hasExtension ? filename.slice(dotIndex) : "";
  const base = hasExtension ? filename.slice(0, dotIndex) : filename;

  const availableForBase = maxLength - extension.length - 3; // 3 = "..."
  if (availableForBase <= 0) {
    return `${filename.slice(0, maxLength - 3)}...`;
  }

  return `${base.slice(0, availableForBase)}...${extension}`;
}
