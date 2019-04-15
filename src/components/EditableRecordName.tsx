import { EditableText, Icon, Intent, Popover, Position, IconName } from '@blueprintjs/core';
import * as csstips from 'csstips';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';

interface IProps<REC_TYPE> {
    className: string;
    icon: IconName;
    iconLegend: string;
    placeholder: string;
    fontSize: number;
    record: REC_TYPE;
    recordList: ReadonlyArray<Readonly<REC_TYPE>>;
    getNameFromRecord: (rec: REC_TYPE) => string;
    renameRecord: (rec: REC_TYPE, newName: string) => void;
}

@observer export class EditableRecordName<RECORD_TYPE> extends React.Component<IProps<RECORD_TYPE>, {}> {

    private refEditableName: React.LegacyRef<EditableText> = React.createRef();
    @observable private messageErrorName = '';
    @observable private incorrectName = false;
    @observable private currentName: string = undefined;

    public constructor(props: IProps<RECORD_TYPE>) {
        super(props);
        if (this.currentName === undefined && this.props.getNameFromRecord(this.props.record)) {
            this.currentName = this.props.getNameFromRecord(this.props.record);
        } else {
            this.currentName = 'titi';
        }
    }

    public render() {
        console.log('currentName ' + this.currentName);

        return (
            <div className={style(csstips.content, csstips.horizontal, csstips.gridSpaced(10))}>
                <Icon
                    icon={this.props.icon}
                    color="lightgray"
                    title={this.props.iconLegend}
                />
                <Popover
                    content={<div className={style(csstips.horizontal, csstips.margin(10))}>
                                <div className={style(csstips.margin(5))}>
                                    <Icon icon="warning-sign" iconSize={Icon.SIZE_LARGE} intent={Intent.DANGER} />
                                </div>
                                <div className={style(csstips.margin(5), csstips.vertical)}>
                                    {this.messageErrorName}
                                </div>
                            </div>}
                    position={Position.RIGHT}
                    enforceFocus={false}
                    isOpen={this.incorrectName}
                >
                    <EditableText
                        ref={this.refEditableName}
                        intent={this.incorrectName ? Intent.DANGER : Intent.NONE}
                        className={style({fontSize: this.props.fontSize + 'px'})}
                        placeholder={this.props.placeholder}
                        value={this.currentName}
                        onConfirm={(value: string) => {
                            this.verifyRecordName();
                            if ( !this.incorrectName ) {
                                this.saveRecord(value);
                            }
                        }}
                        onChange={(value: string) => {
                            console.log(value)
                            this.currentName = value;
                        }}
                        multiline={false}
                        confirmOnEnterKey={true}
                        selectAllOnFocus={false}
                    />
                </Popover>
            </div>
        );
    }

    private saveRecord = (newRecordName: string) => {
        if ( !this.incorrectName ) {
            let oldTemplateName = this.props.getNameFromRecord(this.props.record);
            if ( newRecordName !== oldTemplateName ) {
                this.props.renameRecord(this.props.record, newRecordName);
            }
        }
    }

    private verifyRecordName = (): void => {
        if ( this.currentName === this.props.getNameFromRecord(this.props.record) ) {
            this.incorrectName = false;
            this.messageErrorName = '';
        }
        else if ( this.props.recordList.find((record) => this.currentName === this.props.getNameFromRecord(record) ) ) {
            this.incorrectName = true;
            this.messageErrorName = this.currentName + ' already used !';
        }
        else {
            this.incorrectName = false;
            this.messageErrorName = '';
        }
    }
}
