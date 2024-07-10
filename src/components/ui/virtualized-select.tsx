import React, { useEffect, useState } from "react";
import Select, { StylesConfig, MenuListProps } from "react-select";
import { FixedSizeList } from "react-window";
import SearchIcon from "@mui/icons-material/Search";
import { GroupBase } from "react-select";

interface OptionType {
  value: any;
  label: string;
}

interface VirtualizedSelectProps {
  id: string;
  options: OptionType[];
  value: OptionType | null;
  onChange: (selectedOption: OptionType | null) => void;
  placeholder?: string;
  customStyles?: StylesConfig<OptionType, false>;
  dropDownIndicator: boolean;
}

const MenuList = <OptionType extends { value: any; label: string }>({
  children,
  maxHeight,
}: MenuListProps<OptionType, false, GroupBase<OptionType>>) => {
  if (!children) {
    return null; // or return a fallback UI if preferred
  }

  const childArray = React.Children.toArray(children) as React.ReactNode[];
  const height = maxHeight;
  const itemCount = childArray.length;
  const itemSize = 35;

  return (
    <FixedSizeList
      height={height}
      itemCount={itemCount}
      itemSize={itemSize}
      width="100%"
    >
      {({ index, style }) => <div style={style}>{childArray[index]}</div>}
    </FixedSizeList>
  );
};

const VirtualizedSelect: React.FC<VirtualizedSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  customStyles,
  dropDownIndicator,
}) => {
  return (
    <Select
      instanceId={id}
      styles={customStyles}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      components={
        dropDownIndicator
          ? { MenuList, DropdownIndicator: () => <SearchIcon /> }
          : undefined
      }
      isClearable
      isSearchable
    />
  );
};

export default VirtualizedSelect;
