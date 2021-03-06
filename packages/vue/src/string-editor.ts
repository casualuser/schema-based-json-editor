import Vue from "vue";
import Component from "vue-class-component";
import * as common from "schema-based-json-editor";
import { MarkdownIt, HLJS } from "schema-based-json-editor/dist/libs";
import { stringEditorTemplateHtml } from "./variables";
import "markdown-tip-vue";
import "select2-vue-component";

@Component({
    template: stringEditorTemplateHtml,
    props: ["schema", "initialValue", "title", "theme", "icon", "locale", "readonly", "required", "hasDeleteButton", "dragula", "md", "hljs", "forceHttps"],
})
export class StringEditor extends Vue {
    schema: common.StringSchema;
    initialValue: string | undefined;
    title: string;
    theme: common.Theme;
    icon: common.Icon;
    locale: common.Locale;
    readonly: boolean;
    required: boolean;
    hasDeleteButton: boolean;
    md?: MarkdownIt;
    hljs?: HLJS;
    forceHttps?: boolean;

    value?: string = "";
    errorMessage?: string = "";
    buttonGroupStyle = common.buttonGroupStyleString;
    collapsed = false;
    imagePreviewStyle = common.imagePreviewStyleString;

    onChange(e: { target: { value: string } }) {
        this.value = e.target.value;
        this.validate();
        this.$emit("update-value", { value: this.value, isValid: !this.errorMessage });
    }

    beforeMount() {
        this.value = common.getDefaultValue(this.required, this.schema, this.initialValue) as string;
        this.validate();
        this.$emit("update-value", { value: this.value, isValid: !this.errorMessage });
    }

    private get canPreviewImage() {
        return common.isImageUrl(this.value);
    }
    private get canPreviewMarkdown() {
        return this.md && this.schema.format === "markdown";
    }
    private get canPreviewCode() {
        return this.hljs && this.schema.format === "code";
    }
    get canPreview() {
        return (!!this.value) && (this.canPreviewImage || this.canPreviewMarkdown || this.canPreviewCode);
    }
    get useTextArea() {
        return this.value !== undefined
            && !this.collapsed
            && (this.schema.enum === undefined || this.isReadOnly)
            && (this.schema.format === "textarea" || this.schema.format === "code" || this.schema.format === "markdown");
    }
    get useInput() {
        return this.value !== undefined
            && !this.collapsed
            && (this.schema.enum === undefined || this.isReadOnly)
            && (this.schema.format !== "textarea" && this.schema.format !== "code" && this.schema.format !== "markdown");
    }
    get useSelect() {
        return this.value !== undefined && this.schema.enum !== undefined && !this.isReadOnly;
    }
    get getImageUrl() {
        return this.forceHttps ? common.replaceProtocal(this.value!) : this.value;
    }
    get getMarkdown() {
        return this.md!.render(this.value!);
    }
    get getCode() {
        return this.hljs!.highlightAuto(this.value!).value;
    }
    get isReadOnly() {
        return this.readonly || this.schema.readonly;
    }
    get hasDeleteButtonFunction() {
        return this.hasDeleteButton && !this.isReadOnly;
    }
    get willPreviewImage() {
        return this.value && !this.collapsed && this.canPreviewImage;
    }
    get willPreviewMarkdown() {
        return this.value && !this.collapsed && this.canPreviewMarkdown;
    }
    get willPreviewCode() {
        return this.value && !this.collapsed && this.canPreviewCode;
    }
    get titleToShow() {
        return common.getTitle(this.title, this.schema.title);
    }
    get options() {
        return this.schema.enum!.map(e => ({
            value: e,
            label: e,
        }));
    }

    updateSelection(value: string) {
        this.value = value;
        this.validate();
        this.$emit("update-value", { value: this.value, isValid: !this.errorMessage });
    }

    toggleOptional() {
        this.value = common.toggleOptional(this.value, this.schema, this.initialValue) as string | undefined;
        this.validate();
        this.$emit("update-value", { value: this.value, isValid: !this.errorMessage });
    }
    collapseOrExpand() {
        this.collapsed = !this.collapsed;
    }
    private validate() {
        this.errorMessage = common.getErrorMessageOfString(this.value, this.schema, this.locale);
    }
}
