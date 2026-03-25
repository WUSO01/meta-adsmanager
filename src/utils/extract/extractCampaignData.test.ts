import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Extract from "./extract";

import { RowData } from "@/shares/types";

const insertRow = () => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <span data-surface-wrapper="1" data-surface="/am/table/table_row:120240218110500043unit" style="display: contents;">
      <div class="_1gda _2djg" style="width: 2296px; height: 46px; z-index: 0; transform: translate(0px, 46px);">
        <div class="_1gd4 _4li _4lo _52nn _4muv  _5a1n _3c7k x1es45g1" role="presentation"
          style="width: 2296px; height: 46px;">
          <div class="_1gd5">
            <div class="x10l6tqk x13vifvy" style="height: 46px; left: 0px;">
              <div class="_3pzj"
                style="height: 46px; position: absolute; width: 513px; will-change: transform; z-index: 2; transform: translate(0px, 0px);">
                <span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:row_selector"
                  style="display: contents;">
                  <div class="_4lg0 _4lg6 _4h2q _4h2m" style="height: 46px; width: 49px; left: 0px;">
                    <div class="_1b33 _1xah">
                      <div class="x1rg5ohu x5yr21d">
                        <div class="x6s0dn4 x78zum5 xl56j7k x2lwn1j xeuugli x5yr21d"><span id="row-checkbox-1">
                            <div class="x1rg5ohu x1n2onr6 x3oybdh">
                              <div class="x1n2onr6 x14atkfc">
                                <div
                                  class="x6s0dn4 x78zum5 x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x178xt8z x1lun4ml xso031l xpilrb4 xwebqov x1x9jw1y xrsgblv xceihxd xjwep3j x1t39747 x1wcsgtt x1pczhz8 x1gzqxud xbsr9hj x9f619 xexx8yu xyri2b x18d9i69 x1c1uobl xl56j7k xxk0z11 xvy4d1p">
                                  <div></div>
                                  <div
                                    class="xh8yej3 x5yr21d x1fmog5m xu25z0z x140muxe xo1y3bh x10l6tqk x13vifvy x1o0tod xtijo5x x1ey2m1c x47corl x19yxgo3 x1owg228 xg01cxk x13dflua x6o7n8i x16e9yqp x12w9bfk">
                                  </div>
                                  <div
                                    class="xh8yej3 x5yr21d x1fmog5m xu25z0z x140muxe xo1y3bh x10l6tqk x13vifvy x1o0tod xtijo5x x1ey2m1c x47corl x11cq7h0 x1q3qbx4 xa4qsjk x1esw782 xeeju0t x17t6hpn xxwyo5t x1vjfegm xg01cxk x13dflua x6o7n8i x16e9yqp x12w9bfk">
                                  </div><input aria-checked="true" aria-disabled="false" aria-label=""
                                    aria-describedby="js_bq" aria-labelledby="js_br"
                                    class="xjyslct x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1t137rt x10l6tqk x13vifvy xh8yej3 x1vjfegm"
                                    id="js_bp" type="checkbox" data-auto-logging-id="f3395829d">
                                  <div class="x13dflua xnnyp6c x12w9bfk x78zum5 x6o7n8i x1hc1fzr x3oybdh">
                                    <div class="x3nfvp2 x120ccyz x1qsmy5i" role="presentation"><svg height="16"
                                        viewBox="0 0 16 16" width="16">
                                        <path
                                          d="M13.305 3.28L5.993 10.6l-3.31-3.306a1 1 0 00-1.415 1.414l4.013 4.012a.997.997 0 001.414 0l8.024-8.024a1 1 0 00-1.414-1.416z">
                                        </path>
                                      </svg></div>
                                  </div>
                                </div>
                                <div
                                  class="xwebqov x1x9jw1y xrsgblv xceihxd xjwep3j x1t39747 x1wcsgtt x1pczhz8 x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x178xt8z x1lun4ml xso031l xpilrb4 x13dflua x6o7n8i xxziih7 x12w9bfk xg01cxk x47corl x10l6tqk x1o0tod xtijo5x x13vifvy x1ey2m1c x6ikm8r x10wlt62 xnl74ce x11v5mnd xdx8kah x1e4jdvc xmn8db3 x5gca4s x2te4dl xt46lh7 xfijbtm xfenqrj xgy0gl7 x19igvu x1t0di37 x1q4riu3 xe25xm5 x140d7st x1s928wv x1w3onc2 x1j6awrg xxxjk75 x15v7efq x1hvfe8t x1te75w5">
                                </div>
                              </div>
                            </div>
                          </span></div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(toggle,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 94px; left: 49px;">
                    <div class="_1b33 _a524">
                      <div class="x6s0dn4 x78zum5 xl56j7k x2lwn1j xeuugli x5yr21d">
                        <div data-visualcompletion="ignore" class="">
                          <div>
                            <div class="x6s0dn4 x78zum5 x1q0g3np xozqiw3 x2lwn1j xeuugli x8va1my x1c4vz4f">
                              <div class="x1rg5ohu x1n2onr6 x3oybdh"><input aria-checked="false" aria-label="开/关"
                                  role="switch" aria-describedby="js_cq" aria-labelledby="js_co"
                                  class="xjyslct x1ypdohk x5yr21d x1o0tod xdj266r x14z9mp xat24cr x1lziwak x1w3u9th x1t137rt x10l6tqk x13vifvy xh8yej3 x1vjfegm x47corl"
                                  disabled="" id="js_cp" type="checkbox" value="false">
                                <div class="x1n2onr6 xh8yej3">
                                  <div
                                    class="x6s0dn4 x78zum5 x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x178xt8z x1lun4ml xso031l xpilrb4 xwebqov x1x9jw1y xrsgblv xceihxd x1iwo8zk x1033uif x179ill4 x1b60jn0 x10cdfl8 xis6omg x13dflua xxziih7 x12w9bfk x14qfxbe xexx8yu xyri2b x18d9i69 x1c1uobl x15406qy">
                                    <div class="x1s85apg"></div>
                                    <div
                                      class="xh8yej3 x5yr21d x1fmog5m xu25z0z x140muxe xo1y3bh x10l6tqk x13vifvy x1o0tod xtijo5x x1ey2m1c x47corl x19yxgo3 x1owg228 xg01cxk x13dflua x6o7n8i x16e9yqp x12w9bfk">
                                    </div>
                                    <div
                                      class="xh8yej3 x5yr21d x1fmog5m xu25z0z x140muxe xo1y3bh x10l6tqk x13vifvy x1o0tod xtijo5x x1ey2m1c x47corl x11cq7h0 x1q3qbx4 xa4qsjk x1esw782 xeeju0t x17t6hpn xxwyo5t x1vjfegm xg01cxk x13dflua x6o7n8i x16e9yqp x12w9bfk">
                                    </div>
                                    <div
                                      class="xw4jnvo x1qx5ct2 x12y6twl x1h45990 x1iwo8zk x1033uif x179ill4 x1b60jn0 x13dflua x6o7n8i xxziih7 x12w9bfk x18f9xcu">
                                    </div>
                                  </div>
                                  <div
                                    class="xwebqov x1x9jw1y xrsgblv xceihxd x1iwo8zk x1033uif x179ill4 x1b60jn0 x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x178xt8z x1lun4ml xso031l xpilrb4 x13dflua x6o7n8i xxziih7 x12w9bfk xg01cxk x47corl x10l6tqk x1o0tod xtijo5x x13vifvy x1ey2m1c x6ikm8r x10wlt62 xnl74ce x11v5mnd xdx8kah x1e4jdvc xmn8db3 x5gca4s x2te4dl xt46lh7 xfijbtm xfenqrj xgy0gl7 x19igvu x1t0di37 x1q4riu3 xe25xm5 x140d7st x1s928wv x1w3onc2 x1j6awrg xxxjk75 x15v7efq x1hvfe8t x1te75w5">
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(name,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 370px; left: 143px;">
                    <div class=" _1b33" id="js_ct">
                      <div class="x9f619 x78zum5 xdj266r x14z9mp xat24cr x1lziwak">
                        <div class="x1iyjqo2 x6ikm8r x10wlt62">
                          <div class="x78zum5 x6s0dn4">
                            <div class="ellipsis _13is" data-hover="tooltip" data-tooltip-content="AA11-2.21 - 广告副本"
                              data-tooltip-display="overflow" data-tooltip-position="below"
                              data-tooltip-text-direction="auto">
                              <div data-visualcompletion="ignore" class="xt0psk2"></div><span data-tracked="true"
                                data-interactable="|mousedown||click|"><a
                                  class="xt0psk2 x1hl2dhg xt0b8zv x1vvvo52 x1fvot60 xxio538 x1qsmy5i xq9mrsl x1yc453h x1h4wwuj x1fcty0u"
                                  href="#"><span class="_3dfi _3dfj">AA11-2.21 - 广告副本</span></a></span>
                            </div>
                            <div data-visualcompletion="ignore" class=""></div>
                          </div><span data-surface-wrapper="1"
                            data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(name,CAMPAIGN_GROUP)/maiba:ad_object_overflow_menu_entrypoint"
                            data-auto-logging-id="f146c2c94" style="display: contents;">
                            <div data-visualcompletion="ignore" class="x1lliihq xlshs6z x1thohka">
                              <div class="x1lliihq">
                                <div style="display: flex;">
                                  <div class="x78zum5 x6ikm8r x10wlt62 x1n2onr6">
                                    <div class="_9p_z">
                                      <div class="_9p_y" role="toolbar">
                                        <div class="x78zum5 x2lwn1j xeuugli"><span data-tracked="true"
                                            data-interactable="|mousedown||click|"><a aria-label="图表"
                                              class="xt0psk2 x1hl2dhg xt0b8zv x1vvvo52 x1fvot60 xxio538 x1qsmy5i xq9mrsl x1yc453h x1h4wwuj x1fcty0u"
                                              href="#"><span class="_3qjp">
                                                <div class="x6s0dn4 x78zum5">
                                                  <div class="x2fvf9 x1gslohp">
                                                    <div class="x3nfvp2 x120ccyz x4s1yf2" role="presentation">
                                                      <div class="xtwfq29"
                                                        style="width: 12px; height: 12px; mask-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/yj/r/qmu2ZjjdH0L.webp&quot;); mask-position: -265px -437px;">
                                                      </div>
                                                    </div>
                                                  </div><span class="ellipsis" data-tooltip-display="overflow">图表</span>
                                                </div>
                                              </span></a></span><span data-tracked="true"
                                            data-interactable="|mousedown||click|"><a aria-label="编辑"
                                              class="xt0psk2 x1hl2dhg xt0b8zv x1vvvo52 x1fvot60 xxio538 x1qsmy5i xq9mrsl x1yc453h x1h4wwuj x1fcty0u"
                                              href="#"><span class="_3qjp">
                                                <div class="x6s0dn4 x78zum5">
                                                  <div class="x2fvf9 x1gslohp">
                                                    <div class="x3nfvp2 x120ccyz x4s1yf2" role="presentation">
                                                      <div class="xtwfq29"
                                                        style="width: 12px; height: 12px; mask-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/yj/r/qmu2ZjjdH0L.webp&quot;); mask-position: -192px -496px;">
                                                      </div>
                                                    </div>
                                                  </div><span class="ellipsis" data-tooltip-display="overflow">编辑</span>
                                                </div>
                                              </span></a></span><span><span data-tracked="true"
                                              data-interactable="|mousedown||click|"><a aria-label="对比"
                                                class="xt0psk2 x1hl2dhg xt0b8zv x1vvvo52 x1fvot60 xxio538 x1qsmy5i xq9mrsl x1yc453h x1h4wwuj x1fcty0u"
                                                href="#"><span class="_3qjp">
                                                  <div class="x6s0dn4 x78zum5">
                                                    <div class="x2fvf9 x1gslohp">
                                                      <div class="x3nfvp2 x120ccyz x4s1yf2" role="presentation">
                                                        <div class="xtwfq29"
                                                          style="width: 12px; height: 12px; mask-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/y_/r/3PoTJMXtjDM.webp&quot;); mask-position: -268px -473px;">
                                                        </div>
                                                      </div>
                                                    </div><span class="ellipsis" data-tooltip-display="overflow">对比</span>
                                                  </div>
                                                </span></a></span></span></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div aria-busy="false" aria-controls="js_cy" aria-expanded="false" aria-haspopup="menu"
                                    class="x1i10hfl xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli x16tdsg8 xggy1nq x1ja2u2z x1t137rt x6s0dn4 x1ejq31n x18oe1m7 x1sy0etr xstzfhl x3nfvp2 xdl72j9 x1q0g3np x2lah0s x193iq5w x1n2onr6 x1hl2dhg x87ps6o xxymvpz xlh3980 xvmahel x1lku1pv x1g40iwv xjwep3j x1t39747 x1wcsgtt x1pczhz8 xo1l8bm xbsr9hj x1v911su xmzvs34 xf159sx xexx8yu x18d9i69"
                                    role="button" tabindex="0"><span
                                      class="x1vvvo52 x1fvot60 xxio538 x1heor9g xq9mrsl x1h4wwuj x1pd3egz xeuugli xh8yej3">
                                      <div class="x78zum5">
                                        <div
                                          class="x1qvwoe0 xjm9jq1 x1y332i5 xjn30re x1jyxor1 x1hb08if x6ikm8r x10wlt62 x10l6tqk xuxw1ft x1i1rx1s"
                                          data-sscoverage-ignore="true">打开下拉菜单</div>
                                        <div
                                          class="x6s0dn4 x78zum5 x1q0g3np xozqiw3 x2lwn1j xeuugli x1iyjqo2 x8va1my x1hc1fzr x13dflua x6o7n8i xxziih7 x12w9bfk xl56j7k xh8yej3">
                                          <div class="x3nfvp2 x120ccyz x1heor9g x2lah0s x1c4vz4f" role="presentation">
                                            <div class="xtwfq29"
                                              style="width: 16px; height: 16px; mask-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/yi/r/fOJKJVUL5Rm.webp&quot;); mask-position: 0px -1655px;">
                                            </div>
                                          </div>​
                                        </div>
                                      </div>
                                    </span></div>
                                </div>
                              </div>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </span></div>
            </div>
            <div class="x10l6tqk x13vifvy" style="height: 46px; left: 513px;">
              <div class="_3pzj"
                style="height: 46px; position: absolute; width: 1783px; will-change: transform; z-index: 0; transform: translate(0px, 0px);">
                <span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(delivery,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 154px; left: 0px;">
                    <div class="_1b33">
                      <div class="xuxw1ft clearfix _ikh">
                        <div class="_4bl7">
                          <div class="x6s0dn4 x78zum5 x2lwn1j xeuugli x1yc453h x1y5rjcf xw4jnvo x1qx5ct2"><span
                              class="xvs2etk xg3wpu6 x1jwbhkm xgg4q86 x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x9f619 x1lliihq x2lah0s xsmyaan x1kpxq89 xwebqov x1x9jw1y xrsgblv xceihxd x1kr8tdy xburx9h xqm4iv x8u93l6"></span>
                          </div>
                        </div>
                        <div class="_4bl9"><span
                            class="x1vvvo52 x1fvot60 xo1l8bm xxio538 xbsr9hj xq9mrsl x1h4wwuj xeuugli">已关闭</span></div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:recommendations_guidance"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 160px; left: 154px;">
                    <div class="x5yr21d">
                      <div class="_4l0w _1b33 _av2o">
                        <div data-hover="tooltip" data-tooltip-display="overflow" data-tooltip-text-direction="auto"
                          class="x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                          <div class="x1rg5ohu">
                            <div class="xt0psk2 x1vvvo52 x1fvot60 xo1l8bm xxio538 xbsr9hj">—</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forAttributionWindow(results,default)"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 170px; left: 314px;"><span>
                      <div class=" _1b33 _av2o">
                        <div class="x1cy8zhl x78zum5 x1q0g3np x1nhvcw1 xozqiw3">
                          <div class="x1r8uery x1iyjqo2 xs83m0k xeuugli">
                            <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                              data-tooltip-text-direction="auto"
                              class="_7el8 x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                              165</div>
                            <div class="ellipsis _1ha4" data-hover="tooltip" data-tooltip-display="overflow"
                              data-tooltip-text-direction="auto">
                              <div class="xt0psk2 x1vvvo52 xw23nyj xo1l8bm x63nzvj x1541jtf">网站购物</div>
                            </div>
                          </div>
                          <div class="xcklp1c x2lah0s">
                            <div class="xdj266r xat24cr x14z9mp xdwrcjd x1yc453h"></div>
                          </div>
                        </div>
                      </div>
                      <div data-visualcompletion="ignore" class=""></div>
                    </span></div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forAttributionWindow(cost_per_result,default)"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 175px; left: 484px;">
                    <div class=" _1b33 _av2o">
                      <div class="x1cy8zhl x78zum5 x1q0g3np x1nhvcw1 xozqiw3">
                        <div class="x1r8uery x1iyjqo2 xs83m0k xeuugli">
                          <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                            data-tooltip-text-direction="auto"
                            class="_7el8 _as5y x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                            <span><span class="_3dfi _3dfj">$10.21</span></span></div>
                          <div class="ellipsis _1ha4" data-hover="tooltip" data-tooltip-display="overflow"
                            data-tooltip-text-direction="auto">
                            <div class="xt0psk2 x1vvvo52 xw23nyj xo1l8bm x63nzvj x1541jtf">单次购物</div>
                          </div>
                        </div>
                        <div class="xcklp1c x2lah0s">
                          <div class="xdj266r xat24cr x14z9mp xdwrcjd x1yc453h"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(budget,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 157px; left: 659px;">
                    <div class=" _1b33 _av2o">
                      <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto"
                        class="x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj"><span>
                          <div data-visualcompletion="ignore" class=""></div><span class="x108nfp6">$1,025.00</span>
                        </span></div>
                      <div class="ellipsis _1ha4" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto">
                        <div class="xt0psk2 x1vvvo52 xw23nyj xo1l8bm x63nzvj x1541jtf">单日</div>
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:spend" style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 198px; left: 816px;"><span>
                      <div class=" _1b33 _av2o">
                        <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                          data-tooltip-text-direction="auto"
                          class=" _as5y x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                          <span><span class="_3dfi _3dfj">$1,684.51</span></span></div>
                      </div>
                    </span></div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:impressions"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 169px; left: 1014px;">
                    <div class=" _1b33 _av2o _4muv _1b33">
                      <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto"
                        class=" _as5y x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                        <span>93,665</span></div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:reach" style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 169px; left: 1183px;">
                    <div class=" _1b33 _av2o _4muv _1b33">
                      <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto"
                        class=" _as5y x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                        <span>74,928</span></div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(end_time,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 113px; left: 1352px;">
                    <div class=" _1b33 _av2o">
                      <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto"
                        class="x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">长期</div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:attribution_setting"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 120px; left: 1465px;"><span>
                      <div class=" _1b33 _av2o">
                        <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                          data-tooltip-text-direction="auto"
                          class="x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">
                          <span>点击后7天、浏览后1天或互动观看后1天</span></div>
                        <div class="ellipsis _1ha4" data-hover="tooltip" data-tooltip-display="overflow"
                          data-tooltip-text-direction="auto">
                          <div class="xt0psk2 x1vvvo52 xw23nyj xo1l8bm x63nzvj x1541jtf">所有转化</div>
                        </div>
                      </div>
                    </span></div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:forObjectType(bid,CAMPAIGN_GROUP)"
                  style="display: contents;">
                  <div class="_4lg0 _4lg5 _4h2p _4h2m" style="height: 46px; width: 166px; left: 1585px;">
                    <div class=" _1b33 _av2o">
                      <div geotextcolor="value" data-hover="tooltip" data-tooltip-display="overflow"
                        data-tooltip-text-direction="auto"
                        class="x1vvvo52 x1fvot60 xo1l8bm xxio538 x1lliihq x6ikm8r x10wlt62 xlyipyv xuxw1ft xbsr9hj">最高数量
                      </div>
                    </div>
                  </div>
                </span><span data-surface-wrapper="1"
                  data-surface="/am/table/table_row:120240218110500043unit/table_cell:suggestions_toggle"
                  style="display: contents;">
                  <div class="_4lg0 _4h2m" style="height: 46px; width: 32px; left: 1751px;">
                    <div class="_4muv _1b33"></div>
                  </div>
                </span></div>
            </div>
            <div class="_1gd6 _1gd8" style="left: 513px; height: 46px;"></div>
          </div>
        </div>
      </div>
    </span>
  `;
  document.body.appendChild(wrapper);
  return wrapper;
};

describe("extractCampaignData", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should extract Campaign row fields correctly", () => {
    insertRow();
    const extract = new Extract()
    const {data, domElements } = extract.extractCampaignData()

    expect(domElements.length).toBe(1);
    expect(data.length).toBe(1);

    const row = data[0] as RowData;

    expect(row.id).toBe("120240218110500043");
    expect(row.level).toBe("campaigns");
    expect(row.status).toBe("关闭");
    expect(row.name).toBe("AA11-2.21 - 广告副本");
    expect(row.delivery).toBe("已关闭");
    expect(row.recommendations).toBe("—");
    expect(row.results).toEqual({ value: 165, type: "网站购物" });
    expect(row.cost_per_result).toEqual({ value: 10.21, type: "单次购物" });
    expect(row.budget).toEqual({ value: "$1,025.00", type: "单日" });
    expect(row.amount_spent).toBe(1684.51);
    expect(row.impressions).toBe(93665);
  });
});
