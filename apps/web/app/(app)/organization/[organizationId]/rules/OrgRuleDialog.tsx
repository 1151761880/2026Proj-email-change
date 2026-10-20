"use client";

import { useMemo, useState } from "react";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { InboxIcon, ZapIcon } from "lucide-react";
import { LogicalOperator } from "@/generated/prisma/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleHeading,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { toastError, toastSuccess } from "@/components/Toast";
import { Form } from "@/components/ui/form";
import { useAction } from "next-safe-action/hooks";
import {
  createOrganizationRuleAction,
  updateOrganizationRuleAction,
} from "@/utils/actions/organization-rule";
import type { OrganizationRuleActionSchema } from "@/utils/actions/organization-rule.validation";
import type { CreateRuleBody } from "@/utils/actions/rule.validation";
import { ConditionType } from "@/utils/config";
import {
  getConditions,
  getEmptyCondition,
  flattenConditions,
} from "@/utils/condition";
import { createScopedLogger } from "@/utils/logger";
import { ConditionSteps } from "@/app/(app)/[emailAccountId]/assistant/ConditionSteps";
import { RuleSectionCard } from "@/app/(app)/[emailAccountId]/assistant/RuleSectionCard";
import { OrgActionSteps } from "./OrgActionSteps";
import { EMPTY_ORG_ACTION, type OrgRuleFormValues } from "./orgRuleForm";
import type { OrganizationRulesResponse } from "@/app/api/organizations/[organizationId]/rules/route";

type OrgRule = OrganizationRulesResponse["rules"][number];

const logger = createScopedLogger("org-rule-dialog");

export function OrgRuleDialog({
  organizationId,
  rule,
  isOpen,
  onClose,
  onSuccess,
}: {
  organizationId: string;
  rule?: OrgRule;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const editing = !!rule;
  // biome-ignore lint/correctness/useExhaustiveDependencies: isOpen forces a re-derive so reopening "New rule" starts clean.
  const values = useMemo(() => toFormValues(rule), [rule, isOpen]);

  const form = useForm<OrgRuleFormValues>({ values });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({ control, name: "conditions" });
  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({ control, name: "actions", keyName: "fieldId" });

  const createAction = useAction(createOrganizationRuleAction);
  const updateAction = useAction(updateOrganizationRuleAction);
  const isSubmitting = createAction.isExecuting || updateAction.isExecuting;

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const conditions = watch("conditions");
  const conditionalOperator = watch("conditionalOperator");

  const onSubmit = handleSubmit(async (formValues) => {
    const conditionFieldValues = flattenConditions(
      formValues.conditions,
      logger,
    );

    const actions = formValues.actions.map((action) => ({
      id: action.id,
      type: action.type as OrganizationRuleActionSchema["type"],
      label: action.label || null,
      subject: action.subject || null,
      content: action.content || null,
      to: action.to || null,
      cc: action.cc || null,
      bcc: action.bcc || null,
      url: action.url || null,
      folderName: action.folderName || null,
      delayInMinutes:
        action.delayInMinutes && action.delayInMinutes > 0
          ? action.delayInMinutes
          : null,
    }));

    const shared = {
      name: formValues.name,
      instructions: conditionFieldValues.instructions || null,
      from: conditionFieldValues.from || null,
      to: conditionFieldValues.to || null,
      subject: conditionFieldValues.subject || null,
      body: formValues.body || null,
      conditionalOperator: formValues.conditionalOperator,
      runOnThreads: formValues.runOnThreads,
      actions,
    };

    const result =
      editing && rule
        ? await updateAction.executeAsync({
            organizationId,
            organizationRuleId: rule.id,
            ...shared,
          })
        : await createAction.executeAsync({ organizationId, ...shared });

    if (result?.serverError || result?.validationErrors) {
      toastError({
        description:
          result.serverError ||
          "There was an error saving the rule. Please check the fields and try again.",
      });
      return;
    }

    toastSuccess({ description: editing ? "Rule updated" : "Rule created" });
    onSuccess();
  });

  // ConditionSteps is typed against the personal-rule form, but only reads and
  // writes `conditions` / `conditionalOperator`, which are identical in both
  // forms. Casting here keeps the shared condition editor out of a generic.
  const conditionStepsForm = form as unknown as UseFormReturn<CreateRuleBody>;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "编辑组织规则" : "新建组织规则"}
          </DialogTitle>
          <DialogDescription>
            此规则适用于组织中的所有成员。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              type="text"
              name="name"
              label="名称"
              registerProps={register("name", {
                required: "Please enter a name",
              })}
              error={errors.name}
              placeholder="例如：为发票添加标签"
            />

            <RuleSectionCard
              icon={InboxIcon}
              color="blue"
              title="收到邮件时"
            >
              <ConditionSteps
                conditionFields={conditionFields}
                conditionalOperator={conditionalOperator}
                removeCondition={removeCondition}
                watch={conditionStepsForm.watch}
                setValue={conditionStepsForm.setValue}
                register={conditionStepsForm.register}
                errors={conditionStepsForm.formState.errors}
                conditions={conditions}
                ruleSystemType={null}
                appendCondition={appendCondition}
              />
            </RuleSectionCard>

            <RuleSectionCard icon={ZapIcon} color="green" title="然后">
              <OrgActionSteps
                fields={actionFields}
                register={register}
                control={control}
                watch={watch}
                setValue={setValue}
                append={appendAction}
                remove={removeAction}
              />
            </RuleSectionCard>

            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleHeading>高级选项</CollapsibleHeading>
              <CollapsibleContent>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">应用于整个会话</p>
                      <p className="text-sm text-muted-foreground">
                        对会话中的每封回复执行此规则。
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Toggle
                        name="runOnThreads"
                        enabled={watch("runOnThreads")}
                        onChange={(enabled) =>
                          setValue("runOnThreads", enabled)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editing ? "保存规则" : "创建规则"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function toFormValues(rule?: OrgRule): OrgRuleFormValues {
  // The shared condition editor has no Body type, so drop any legacy body-only
  // condition from the editable list and carry the value through separately
  // rather than surfacing it as a phantom empty Subject condition.
  const conditions = (rule ? getConditions(rule) : []).filter(
    (condition) => !(condition.type === ConditionType.STATIC && condition.body),
  );
  if (conditions.length === 0) {
    conditions.push(getEmptyCondition(ConditionType.AI));
  }

  return {
    name: rule?.name ?? "",
    conditions,
    body: rule?.body ?? null,
    conditionalOperator: rule?.conditionalOperator ?? LogicalOperator.AND,
    runOnThreads: rule?.runOnThreads ?? false,
    actions: rule?.actions.length
      ? rule.actions.map((action) => ({
          id: action.id,
          type: action.type,
          label: action.label ?? "",
          subject: action.subject ?? "",
          content: action.content ?? "",
          to: action.to ?? "",
          cc: action.cc ?? "",
          bcc: action.bcc ?? "",
          url: action.url ?? "",
          folderName: action.folderName ?? "",
          delayInMinutes: action.delayInMinutes ?? null,
        }))
      : [EMPTY_ORG_ACTION],
  };
}
