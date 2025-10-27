import logoFooter from "@/app/assets/images/logo-footer.svg";
import Image from "next/image";
import Link from "next/link";
import facebookIcon from "@/app/assets/images/facebook-icon.svg";
import twitterIcon from "@/app/assets/images/twitter-icon.svg";
import linkedinIcon from "@/app/assets/images/linkedin-icon.svg";
import youtubeIcon from "@/app/assets/images/youtube-icon.svg";
import soundcloudIcon from "@/app/assets/images/soundcloud-icon.svg";
import githubIcon from "@/app/assets/images/github-icon.svg";

export default function Footer() {
  return (
    <footer className="pt-8 pb-10 border-t border-white/10">
      <div className="w-11/12 mx-auto max-w-7xl">
        <div className="flex flex-col gap-y-8 lg:flex-row lg:justify-between">
          <div className="lg:w-1/12">
            <Image src={logoFooter} alt="OCP Logo" width={89} height={148} />
          </div>
          <div className="lg:w-6/12">
            <div className="flex flex-col gap-y-8 md:flex-row md:gap-x-6">
              <div className="md:w-2/3">
                <div className="border-2 border-[#C8D419] rounded-tl-4xl py-4 px-6 text-white">
                  <h3 className="text-xl font-bold">CONTACT</h3>
                  <Link
                    className="inline-block mt-3.5 underline text-xs"
                    href="mailto:engage@open-contracting.org"
                  >
                    engage@open-contracting.org
                  </Link>
                  <p className="mt-3.5 text-xs">
                    Open Contracting Partnership, <br />
                    1100 13th Street NW, Suite 800, 20005 Washington, D.C., USA
                  </p>
                  <p className="mt-3.5 text-xs">
                    Open Contracting Partnership is an independent non-profit
                    public charity 501(c)(3).
                  </p>
                </div>
              </div>
              <div className="md:w-1/3">
                <h3 className="font-bold text-white">Connect with us:</h3>
                <div className="mt-5 grid grid-cols-2 gap-4 w-1/2 md:translate-x-4 lg:translate-x-6">
                  <Link
                    href="https://twitter.com/opencontracting"
                    target="_blank"
                  >
                    <Image
                      src={twitterIcon}
                      alt="Twitter"
                      width={26}
                      height={26}
                    />
                  </Link>
                  <Link
                    href="https://github.com/open-contracting-partnership/"
                    target="_blank"
                  >
                    <Image
                      src={githubIcon}
                      alt="GitHub"
                      width={26}
                      height={26}
                    />
                  </Link>
                  <Link
                    href="https://www.facebook.com/OpenContracting"
                    target="_blank"
                  >
                    <Image
                      src={facebookIcon}
                      alt="Facebook"
                      width={26}
                      height={26}
                    />
                  </Link>
                  <Link
                    href="https://soundcloud.com/opencontracting"
                    target="_blank"
                  >
                    <Image
                      src={soundcloudIcon}
                      alt="SoundCloud"
                      width={26}
                      height={26}
                    />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/company/open-contracting-partnership"
                    target="_blank"
                  >
                    <Image
                      src={linkedinIcon}
                      alt="LinkedIn"
                      width={26}
                      height={26}
                    />
                  </Link>
                  <Link
                    href="https://www.youtube.com/OpenContractingPartnership"
                    target="_blank"
                  >
                    <Image
                      src={youtubeIcon}
                      alt="YouTube"
                      width={26}
                      height={26}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-[11px]">
            This work by the Open Contracting Partnership, unless otherwise
            noted, is licensed under a Creative Commons Attribution 4.0
            International License.
          </p>
          <div className="mt-4 flex items-center gap-x-4">
            <p className="text-[11px]">
              Open Contracting Partnership {new Date().getFullYear()}
            </p>
            <Link
              href="https://www.open-contracting.org/terms-of-use"
              target="_blank"
              className="underline text-[11px]"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
