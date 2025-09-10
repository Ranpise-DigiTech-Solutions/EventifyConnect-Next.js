import React, { useEffect, useState } from "react";
import Select, { StylesConfig, MenuListProps } from "react-select";
import { FixedSizeList } from "react-window";
import SearchIcon from "@mui/icons-material/Search";
import { GroupBase, components, InputActionMeta } from "react-select";

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
  // This is the new prop to handle user input for filtering
  onInputChange?: (inputValue: string, actionMeta: InputActionMeta) => void;
}

const MenuList = <OptionType extends { value: any; label: string }>({
  children,
  maxHeight,
  ...props
}: MenuListProps<OptionType, false, GroupBase<OptionType>>) => {
  if (!children || !Array.isArray(children)) {
    return null;
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
      // This is crucial for accessibility and keyboard navigation
      outerRef={props.innerRef}
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
  onInputChange,
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
          : { MenuList } // Ensure MenuList is always passed if you want virtualization
      }
      isClearable
      isSearchable
      onInputChange={onInputChange} // Pass the onInputChange prop to the Select component
    />
  );
};

export default VirtualizedSelect;