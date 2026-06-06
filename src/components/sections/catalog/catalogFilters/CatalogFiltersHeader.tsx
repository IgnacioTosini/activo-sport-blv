import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Title } from "@/components/ui/Title/Title";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  total: number;
};

export const CatalogFiltersHeader = ({ search, onSearchChange, total }: Props) => {
  return (
    <header className="catalogFiltersHeader">
      <div>
        <Title text={"Catálogo"} subTitle="TODOS LOS BOTINES" />
        <p className="catalogFiltersCount">{total} modelo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
      </div>

      <label className="catalogFiltersSearch" aria-label="Buscar modelos por nombre o marca">
        <HiOutlineMagnifyingGlass className="catalogFiltersSearchIcon" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar Mercurial, Predator..."
        />
      </label>
    </header>
  );
};
