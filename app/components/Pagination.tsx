import { Button, Group, IconButton } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Link as RRLink } from "react-router";

type Props = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export default function Pagination({ page, totalPages, hrefForPage }: Props) {
  if (totalPages <= 1) return null;

  return (
    <Group justifyContent="center" attached>
      <IconButton
        aria-label="Previous page"
        title="Previous page"
        variant="outline"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <RRLink to={hrefForPage(page - 1)}>
            <LuChevronLeft />
          </RRLink>
        ) : (
          <LuChevronLeft />
        )}
      </IconButton>
      <Button variant="outline" disabled>
        Page {page} of {totalPages}
      </Button>
      <IconButton
        aria-label="Next page"
        title="Next page"
        variant="outline"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <RRLink to={hrefForPage(page + 1)}>
            <LuChevronRight />
          </RRLink>
        ) : (
          <LuChevronRight />
        )}
      </IconButton>
    </Group>
  );
}
