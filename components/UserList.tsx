'use client';
import { useMemo, useState, type ChangeEvent } from "react";

/**
 * Task: Dynamic User List Filter
 *
 * Build a React component that displays a list of users and allows:
 * 1. Searching by name using a text input.
 * 2. Sorting the list by name (A→Z / Z→A) or age (ascending / descending) using a select dropdown.
 *
 * Requirements:
 * - The list should update immediately when the user types or changes the sort option.
 * - Sorting and filtering should be case-insensitive.
 * - Use React hooks (`useState`, `useMemo`) to manage state and performance.
 *
 * Example:
 * Input: "a" → shows ["Alice", "Charlie", "Diana"]
 * Sort by age → shows them in order of increasing age.
 */
interface User { id: number; name: string; age: number; }

const initial: User[] = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
  { id: 3, name: "Charlie", age: 22 },
  { id: 4, name: "Diana", age: 27 }
];

type SortFunction = (a: User, b: User) => number;


export default function UserList() {
    const [query, setQuery] = useState("");
    const [sortOption, setSortOption] = useState("age-asc");
    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };
    const onSort = (e: ChangeEvent<HTMLSelectElement>) => {
        setSortOption(e.target.value);
    };

    const list = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const filtered = normalizedQuery
            ? initial.filter(({ name }) =>
                  name.toLowerCase().includes(normalizedQuery)
              )
            : initial;

        let sortFnc: SortFunction | null = null;
        if (sortOption.startsWith("age-")) {
            sortFnc = sortOption.includes("-asc")
                ? ({ age: ageA }, { age: ageB }) => ageA - ageB
                : ({ age: ageA }, { age: ageB }) => ageB - ageA;
        }
        if (sortOption.startsWith("name-")) {
            sortFnc = sortOption.includes("-asc")
                ? ({ name: nameA }, { name: nameB }) => {
                      const a = nameA.toLowerCase();
                      const b = nameB.toLowerCase();
                      return a === b ? 0 : a < b ? -1 : 1;
                  }
                : ({ name: nameA }, { name: nameB }) => {
                      const a = nameA.toLowerCase();
                      const b = nameB.toLowerCase();
                      return a === b ? 0 : a < b ? 1 : -1;
                  };
        }
        return sortFnc ? [...filtered].sort(sortFnc) : filtered;
    }, [query, sortOption]);
    return (
        <div>
            <input type="text" placeholder="search by name" onChange={onSearch} />
            <select onChange={onSort} value={sortOption}>
                <option value="age-asc">Age ASC</option>
                <option value="age-desc">Age DESC</option>
                <option value="name-asc">Name ASC</option>
                <option value="name-desc">Name DESC</option>
            </select>
            <ul>
                {list.map(({id, name, age}) => <li key={id}>{name} - {age}</li>)}
            </ul>
        </div>
    )
}
