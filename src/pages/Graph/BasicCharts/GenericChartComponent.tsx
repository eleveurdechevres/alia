import * as React from 'react';

export interface IPropsGenericChartComponent {
    chartWidth: number;
    chartHeight: number;
}

export interface IMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export abstract class GenericChartComponent<IProps extends IPropsGenericChartComponent> extends React.Component<IProps, {}> {

    protected static svgBorderWidth = 0;
    constructor(props: IProps) {
        super(props);
    }

    public abstract render(): any;
}
