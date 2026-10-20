"use client";

import useSWR from "swr";
import { LoadingContent } from "@/components/LoadingContent";
import type { ColdEmailsResponse } from "@/app/api/user/cold-email/route";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateCell } from "@/app/(app)/[emailAccountId]/assistant/DateCell";
import { TablePagination } from "@/components/TablePagination";
import { AlertBasic } from "@/components/Alert";
import { useSearchParams } from "next/navigation";
import { ColdEmailStatus } from "@/generated/prisma/enums";
import { ViewEmailButton } from "@/components/ViewEmailButton";
import { EmailMessageCellWithData } from "@/components/EmailMessageCell";
import { useAccount } from "@/providers/EmailAccountProvider";

export function ColdEmailRejected() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const { data, isLoading, error } = useSWR<ColdEmailsResponse>(
    `/api/user/cold-email?page=${page}&status=${ColdEmailStatus.USER_REJECTED_COLD}`,
  );

  const { userEmail } = useAccount();

  return (
    <LoadingContent loading={isLoading} error={error}>
      {data?.coldEmails.length ? (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邮件</TableHead>
                <TableHead>AI 判断依据</TableHead>
                <TableHead>日期</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.coldEmails.map((coldEmail) => (
                <Row key={coldEmail.id} row={coldEmail} userEmail={userEmail} />
              ))}
            </TableBody>
          </Table>

          <TablePagination totalPages={data.totalPages} />
        </div>
      ) : (
        <NoRejectedColdEmails />
      )}
    </LoadingContent>
  );
}

function Row({
  row,
  userEmail,
}: {
  row: ColdEmailsResponse["coldEmails"][number];
  userEmail: string;
}) {
  return (
    <TableRow key={row.id}>
      <TableCell>
        <EmailMessageCellWithData
          sender={row.fromEmail}
          userEmail={userEmail}
          threadId={row.threadId || ""}
          messageId={row.messageId || ""}
        />
      </TableCell>
      <TableCell>{row.reason || "-"}</TableCell>
      <TableCell>
        <DateCell createdAt={row.createdAt} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end space-x-2">
          <ViewEmailButton
            threadId={row.threadId || ""}
            messageId={row.messageId || ""}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function NoRejectedColdEmails() {
  return (
    <div className="p-2">
      <AlertBasic
        title="暂无标为正常的邮件"
        description="将 AI 识别的陌生邮件改为正常邮件后，会显示在这里。"
      />
    </div>
  );
}
