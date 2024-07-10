import React from 'react'

type Props = {
    active: number,
    imageList: Array<any>,
    className: string
}

const NavigationDots = ({ active, imageList, className }: Props) => {
    return (
        <div>
          <div className="app__navigation">
            {imageList.map((item,index)=>(
                <div
                key={"Image-" + index}
                className={className}
                style={active===index? {backgroundColor:`#313bac`} : {}}
                />
            ))}
          </div>
        </div>
      )
}

export default NavigationDots