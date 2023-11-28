import type { ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";
import Layout from "@/layouts/layout";
import { BiPlus } from "react-icons/bi";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "@/lib/api";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Profile,
  type Resume,
  type Section,
  type SectionContent,
} from "@prisma/client";
import { formatFullDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { CopyIcon, DownloadIcon, EditIcon } from "lucide-react";
import { GrChapterAdd } from "react-icons/gr";

type SectionT = Section & { sectionContent: SectionContent[] };
type ResumeT = Resume & { sections: SectionT[] };

const Resumes: NextPageWithLayout = () => {
  const { push } = useRouter();

  const { data, isLoading } = api.listResumes.useQuery();
  const resumes = data?.resumes;
  const profile = data?.profile;

  if (!profile) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-10">
        <div className="">Loading...</div>
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((i) => {
            return (
              <Skeleton
                key={i}
                className="flex h-[842px] w-[595px] origin-top-left scale-50 rounded-md border"
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-screen-xl flex-1 flex-col gap-10 p-5">
      <div className="flex border-b pb-8">
        <h1 className="self-start text-2xl font-medium">My Resumes</h1>
        <Button size={"sm"} asChild>
          <div className="ml-auto flex cursor-pointer items-center gap-2 bg-indigo-600  px-3 py-2 text-white">
            <GrChapterAdd size={14} className="flex-shrink-0" />
            <span className="flex flex-1 text-xs">Add resume</span>
          </div>
        </Button>
      </div>
      <div className="grid grid-cols-2 items-start justify-start gap-5">
        {resumes?.map((resume: ResumeT, i: number) => {
          return (
            <div className="relative flex gap-4" key={i}>
              <ResumeItem resume={resume} profile={profile} />
              <div className="absolute left-[53%] flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">{resume.title}</h3>
                  <span className="text-sm text-slate-500">
                    Edited two week ago
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <Button size={"sm"} variant="outline" asChild>
                    <Link
                      href={`/resumes/${resume?.title}`}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2"
                    >
                      <EditIcon
                        size={14}
                        className="flex-shrink-0 text-slate-600"
                      />
                      <span className="flex flex-1 text-xs">
                        Open in Editor
                      </span>
                    </Link>
                  </Button>
                  <Button size={"sm"} variant="ghost" asChild>
                    <div className="flex cursor-pointer items-center gap-2 px-3 py-2">
                      <CopyIcon
                        size={14}
                        className="flex-shrink-0 text-slate-600"
                      />
                      <span className="flex flex-1 flex-shrink-0 text-xs">
                        Make a copy
                      </span>
                    </div>
                  </Button>
                  <Button size={"sm"} variant="ghost" asChild>
                    <div className="flex cursor-pointer items-center gap-2 px-3 py-2">
                      <DownloadIcon
                        size={14}
                        className="flex-shrink-0 text-slate-600"
                      />
                      <span className="flex flex-shrink-0 text-xs">
                        Download a PDF
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {resumes && resumes?.length > 0 ? (
          <div
            onClick={() => {
              void push("/new");
            }}
            className="flex cursor-pointer items-center justify-center space-x-2 rounded border border-dashed p-5"
          >
            <BiPlus />
            <p>Create new</p>
          </div>
        ) : (
          <div className="">No resume Added</div>
        )}
      </div>
    </div>
  );
};

Resumes.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

const ResumeItem = ({
  resume,
  profile,
}: {
  resume: ResumeT;
  profile: Profile;
}) => {
  const sections = resume.sections
    ? resume.sections.filter(
        (s: Section) => !["SKILLS", "LANGUAGES", "INTERESTS"].includes(s.type),
      )
    : [];
  return (
    <div className="flex h-[842px] w-[595px] origin-top-left scale-50 font-thin shadow-sm">
      <div className="flex w-[188px] flex-col rounded-l-3xl bg-slate-600 px-3 py-5 text-white">
        <Sidebar profile={profile} resume={resume} />
      </div>
      <div className="shadow-r-md flex flex-1 flex-col rounded rounded-r-3xl border bg-white p-5">
        {profile.shortBio && (
          <div className="flex flex-col gap-3.5">
            <h3 className="text-lg font-medium capitalize">Profile</h3>
            <p className="text-justify text-sm">{profile.shortBio}</p>
          </div>
        )}
        {sections.map((sec: SectionT, i: number) => {
          return (
            <div className="mt-8 flex flex-col" key={i}>
              <h3 className="text-lg font-medium">{sec.title}</h3>
              <SectionContentItem sectionContent={sec.sectionContent} key={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

function SectionContentItem({
  sectionContent,
}: {
  sectionContent: SectionContent[];
}) {
  return (
    <div className="mt-3.5 flex flex-col gap-1">
      {sectionContent
        ? sectionContent.map((cont: SectionContent, i: number) => {
            const { title, from, until, establishment, description } = cont;

            return (
              <div className="mt-2 flex flex-col" key={i}>
                <span className="text-sm font-medium">{establishment}</span>
                <div className="flex justify-between">
                  <span className="text-sm">{title}</span>
                  {from && (
                    <div className="text-xs text-slate-500">
                      {formatFullDate(from, until ?? new Date())}
                    </div>
                  )}
                </div>
                <p className="px-2 text-justify text-[13px]">{description}</p>
              </div>
            );
          })
        : null}
    </div>
  );
}

function Sidebar({ resume, profile }: { resume: ResumeT; profile: Profile }) {
  if (!profile) {
    return null;
  }
  const {
    fullName,
    email,
    profilePic,
    jobTitle,
    phone,
    location,
    dribbble,
    linkedIn,
    github,
  } = profile;

  const skillSection = resume.sections.find(
    (s: SectionT) => s.type == "SKILLS",
  );

  const languageSection = resume.sections.find(
    (s: SectionT) => s.type == "LANGUAGES",
  );

  const skills = skillSection ? skillSection.sectionContent : [];
  const languages = languageSection ? languageSection.sectionContent : [];

  const isSocial = dribbble ?? linkedIn ?? github;

  return (
    <>
      <div className="flex flex-col gap-3">
        <Image
          src={profilePic ?? "/"}
          alt="pic"
          className="rounded-full border border-slate-500"
          width={80}
          height={80}
        />

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">{fullName}</h3>
          <span className="text-sm">{jobTitle}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <h3 className="text-lg font-medium">Contact</h3>
        {location && (
          <div className="mt-3.5 flex flex-col gap-1">
            <span className="text-sm font-medium">Adress</span>
            <span className="text-xs">{location}</span>
          </div>
        )}
        {phone && (
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-sm font-medium">Phone</span>
            <span className="text-xs">{phone}</span>
          </div>
        )}
        {email && (
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <span className="text-xs">{email}</span>
          </div>
        )}
      </div>

      {isSocial && (
        <div className="mt-8 flex flex-col">
          <h3 className="text-lg font-medium">Socials</h3>
          {linkedIn && (
            <div className="mt-3.5 flex flex-col gap-1">
              <span className="text-sm font-medium">LinkedIn</span>
              <span className="text-xs">{linkedIn}</span>
            </div>
          )}
          {dribbble && (
            <div className="mt-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Dribble</span>
              <span className="text-xs">{dribbble}</span>
            </div>
          )}
          {github && (
            <div className="mt-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Github</span>
              <span className="text-xs">{github}</span>
            </div>
          )}
        </div>
      )}
      {skills.length > 0 && (
        <div className="mt-8 flex flex-col">
          <h3 className="text-lg font-medium">Skills</h3>
          {skills.map((s: SectionContent, i: number) => {
            const { level, title } = s;
            return (
              <div className="mt-3.5 flex flex-col gap-1" key={i}>
                <span className="text-sm font-medium">{title}</span>
                <div className="h-1 w-full rounded-full bg-slate-400">
                  <div
                    className={`h-1 rounded-full bg-slate-50`}
                    style={{
                      width: `${level}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {languages.length > 0 && (
        <div className="mt-8 flex flex-col">
          <h3 className="text-lg font-medium">Languages</h3>
          {languages.map((l: SectionContent, i: number) => {
            const { level, title } = l;
            return (
              <div className="mt-3.5 flex flex-col gap-1" key={i}>
                <span className="text-sm font-medium">{title}</span>
                <div className="h-1 w-full rounded-full bg-slate-400">
                  <div
                    className="h-1 rounded-full bg-slate-50"
                    style={{
                      width: `${level}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Resumes;
