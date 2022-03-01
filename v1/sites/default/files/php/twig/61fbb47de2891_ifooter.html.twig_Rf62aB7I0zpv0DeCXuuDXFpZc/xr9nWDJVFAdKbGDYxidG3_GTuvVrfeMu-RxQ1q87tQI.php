<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* @ibplc/ifooter.html.twig */
class __TwigTemplate_87a745e4baf4a662e62137cae97746db7e5af43fcc341f7dac6ca943a2fe9346 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = [];
        $filters = ["escape" => 1];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                [],
                ['escape'],
                []
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        // line 1
        echo "<footer class=\"footer\" style=\"background-image:url('";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)) . $this->sandbox->ensureToStringAllowed(($context["directory"] ?? null))), "html", null, true);
        echo "/footer_wave.svg'); background-position: center bottom;\">
    <div class=\"footer-inner\">
        <div class=\"footer-main\">
            <div class=\"footer-link-container footer-link-container--level-0\">
                <ul class=\"footer-link-list\">
                    <li class=\"footer-link-item--short-link-container\">
                        <ul class=\"footer-link-item--short-links\">

                            <li class=\"footer-link-item--short-link-item\">
                                <div class=\"footer-link--wrapper\">
                                    <a href=\"";
        // line 11
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "policies\" class=\"footer-link\">Our Policies</a>
                                </div>
                            </li>
                            <li class=\"footer-link-item--short-link-item\">
                                <div class=\"footer-link--wrapper\">
                                    <a href=\"";
        // line 16
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "what-we-do\" class=\"footer-link\">What We Do</a>
                                </div>
                            </li>
                            <li class=\"footer-link-item--short-link-item\">
                                <div class=\"footer-link--wrapper\">
                                    <a href=\"";
        // line 21
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "brands\" class=\"footer-link\">Our Brands</a>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li class=\"footer-link-item has-subnav\">
                        <div class=\"footer-link--wrapper title-link\">
                            <a href=\"";
        // line 28
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "policies\" class=\"footer-link\">Who We Are</a>
                        </div>
                        <div class=\"footer-link-container footer-link-container--level-1 \">
                            <ul class=\"footer-link-list--level-1\">
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 34
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "values\" class=\"footer-link\">Our Values</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 39
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "mission\" class=\"footer-link\">Our Dream</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 44
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "history\" class=\"footer-link\">Our Heritage</a>
                                    </div>
                                </li>
                            </ul>

                        </div>
                    </li>
                    <li class=\"footer-link-item has-subnav\">
                        <div class=\"footer-link--wrapper title-link\">
                            <a href=\"";
        // line 53
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "sustainability\" class=\"footer-link\">Smart Drinking</a>
                        </div>
                        <div class=\"footer-link-container footer-link-container--level-1 \">
                            <ul class=\"footer-link-list--level-1\">
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 59
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/smart-drinking-beliefs\" class=\"footer-link\">Smart Drinking Beliefs</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 64
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/smart-drinking-goals\" class=\"footer-link\">Smart Drinking Goals</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 69
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/alcohol-health\" class=\"footer-link\">Alcohol & Health</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 74
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/marketing-advertising-sales\" class=\"footer-link\">Marketing, Advertising & Sales</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 79
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/disrupting-harmful-drinking\" class=\"footer-link\">Disrupting Harmful Drinking</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 84
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "ibcontent/voluntary-labeling\" class=\"footer-link\">Voluntary Labeling for All Products</a>
                                    </div>
                                </li>
                            </ul>
                            
                        </div>
                        
                        
                    </li>
                    <li class=\"footer-link-item has-subnav\">
                        <div class=\"footer-link--wrapper title-link\">
                            <a href=\"";
        // line 95
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "careers\" class=\"footer-link\">Careers</a>
                        </div>
                        <div class=\"footer-link-container footer-link-container--level-1 \">
                            <ul class=\"footer-link-list--level-1\">
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 101
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "gmtp\" class=\"footer-link\">Global Management Trainee<br> Programme</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class=\"footer-link-item has-subnav\">
                        <div class=\"footer-link--wrapper title-link\">
                            <a href=\"";
        // line 109
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "investors\" class=\"footer-link\"> Investors</a>
                        </div>
                        <div class=\"footer-link-container footer-link-container--level-1 \">
                            <ul class=\"footer-link-list--level-1\">
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 115
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "board\" class=\"footer-link\">Our Board</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 120
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "po\" class=\"footer-link\">Purchase Order</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 125
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "reports\" class=\"footer-link\">Annual Reports T&C</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li class=\"footer-link-item has-subnav\">
                        <div class=\"footer-link--wrapper title-link\">
                            <div class=\"footer-link\">Connect</div>
                        </div>
                        <div class=\"footer-link-container footer-link-container--level-1 mobile-show\">
\t\t\t\t\t\t\t\t
                            <ul class=\"footer-link-list--level-1\">
                                <li class=\"footer-link-item\">
                           <ul class=\"fb_icons2 agile-1\">
\t\t\t                <li><a class=\"fb\" href=\"https://www.facebook.com/InternationalBreweriesPlc/\"></a></li>
\t\t\t                <li><a class=\"twit\" href=\"https://twitter.com/ibplc_ng\"></a></li>
\t\t\t                <li><a class=\"goog\" href=\"https://instagram.com/ibplc_ng\"></a></li>
\t\t\t                <li><a class=\"drib\" href=\"https://ng.linkedin.com/company/international-breweries-plc\"></a></li>
\t\t                   </ul>
                                </li>
                                
                                 <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 150
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "media\" class=\"footer-link\">News &amp; Media</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"";
        // line 155
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)), "html", null, true);
        echo "contactus\" class=\"footer-link\">Contact</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"#\" class=\"footer-link\">FAQ</a>
                                    </div>
                                </li>
                                <li class=\"footer-link-item\">
                                    <div class=\"footer-link--wrapper\">
                                        <a href=\"#\" class=\"footer-link\" target=\"_blank\">Compliance Helpline</a>
                                    </div>
                                </li>
                               
                            </ul>
                        </div>
                    </li>
                </ul>
            </div> 
        </div>
        <div class=\"footer-bottom\">
            <span class=\"footer-cr\">© 2020 International Breweries PLC -  All rights reserved.</span>
            <ul class=\"footer-util-items\">
                <li class=\"footer-util-item\"><a href=\"#\" class=\"footer-util-link\">Privacy &amp; Cookies</a></li>
                <li class=\"footer-util-item\"><a href=\"#\" class=\"footer-util-link\">Terms and Conditions</a></li>
            </ul>
        </div>
    </div>



</footer>
<div id=\"age-gate\" style=\"background-color:#000;\">
<div id=\"age-form\" style=\"background-color:none;\">
<img alt=\"International Breweries Logo\" data-entity-type=\"file\" data-entity-uuid=\"f79f1aae-3b6d-4e4a-adbb-cd6c18fb91a6\" src=\"";
        // line 189
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ($this->sandbox->ensureToStringAllowed(($context["base_path"] ?? null)) . $this->sandbox->ensureToStringAllowed(($context["directory"] ?? null))), "html", null, true);
        echo "/nlogo.png\" style=\"padding:5px; padding-left:23px; width:180px; margin-right:auto; margin-left:auto;\" width=\"180\" class=\"align-center\" />
    <h1 style=\"color:orange; font-size:18px; text-align:center; text-transform:none;line-height:27px; font-family: verdana;\">
\tAs part of our commitment to responsible drinking, please provide your date of birth to confirm you are of legal drinking age.
\t<br /><span id=\"notify\" style=\"color:red; background-color:#000;\"> </span>
\t</h1>
<br><label style=\"width:32%;\">
<select id=\"day\" style=\"width:100%;\">
<option selected=\"selected\" value=\"0\">DAY</option>
<option value=\"1\">1</option>
<option value=\"2\">2</option>
<option value=\"3\">3</option>
<option value=\"4\">4</option>
<option value=\"5\">5</option>
<option value=\"6\">6</option>
<option value=\"7\">7</option>
<option value=\"8\">8</option>
<option value=\"9\">9</option>
<option value=\"10\">10</option>
<option value=\"11\">11</option>
<option value=\"12\">12</option>
<option value=\"13\">13</option>
<option value=\"14\">14</option>
<option value=\"15\">15</option>
<option value=\"16\">16</option>
<option value=\"17\">17</option>
<option value=\"18\">18</option>
<option value=\"19\">19</option>
<option value=\"20\">20</option>
<option value=\"21\">21</option>
<option value=\"22\">22</option>
<option value=\"23\">23</option>
<option value=\"24\">24</option>
<option value=\"25\">25</option>
<option value=\"26\">26</option>
<option value=\"27\">27</option>
<option value=\"28\">28</option>
<option value=\"29\">29</option>
<option value=\"30\">30</option>
<option value=\"31\">31</option></select></label> 

<label style=\"width:32%;\">
<select id=\"month\" name=\"month\" style=\"width:100%;\">
<option selected=\"selected\" value=\"0\">MONTH</option>
<option value=\"1\">January</option>
<option value=\"2\">February</option>
<option value=\"3\">March</option>
<option value=\"4\">April</option>
<option value=\"5\">May</option>
<option value=\"6\">June</option>
<option value=\"7\">July</option>
<option value=\"8\">August</option>
<option value=\"9\">September</option>
<option value=\"10\">October</option>
<option value=\"11\">November</option>
<option value=\"12\">December</option></select></label>

<label style=\"width:32%;\">
<select id=\"year\" name=\"year\" style=\"width:100%;\">
<option selected=\"selected\" value=\"0\">YEAR</option>
<option value=\"2018\">2018</option>
<option value=\"2017\">2017</option>
<option value=\"2016\">2016</option>
<option value=\"2015\">2015</option>
<option value=\"2014\">2014</option>
<option value=\"2013\">2013</option>
<option value=\"2012\">2012</option>
<option value=\"2011\">2011</option>
<option value=\"2010\">2010</option>
<option value=\"2009\">2009</option>
<option value=\"2008\">2008</option>
<option value=\"2007\">2007</option>
<option value=\"2006\">2006</option>
<option value=\"2005\">2005</option>
<option value=\"2004\">2004</option>
<option value=\"2003\">2003</option>
<option value=\"2002\">2002</option>
<option value=\"2001\">2001</option>
<option value=\"2000\">2000</option>
<option value=\"1999\">1999</option>
<option value=\"1998\">1998</option>
<option value=\"1997\">1997</option>
<option value=\"1996\">1996</option>
<option value=\"1995\">1995</option>
<option value=\"1994\">1994</option>
<option value=\"1993\">1993</option>
<option value=\"1992\">1992</option>
<option value=\"1991\">1991</option>
<option value=\"1990\">1990</option>
<option value=\"1989\">1989</option>
<option value=\"1988\">1988</option>
<option value=\"1987\">1987</option>
<option value=\"1986\">1986</option>
<option value=\"1985\">1985</option>
<option value=\"1984\">1984</option>
<option value=\"1983\">1983</option>
<option value=\"1982\">1982</option>
<option value=\"1981\">1981</option>
<option value=\"1980\">1980</option>
<option value=\"1979\">1979</option>
<option value=\"1978\">1978</option>
<option value=\"1977\">1977</option>
<option value=\"1976\">1976</option>
<option value=\"1975\">1975</option>
<option value=\"1974\">1974</option>
<option value=\"1973\">1973</option>
<option value=\"1972\">1972</option>
<option value=\"1971\">1971</option>
<option value=\"1970\">1970</option>
<option value=\"1969\">1969</option>
<option value=\"1968\">1968</option>
<option value=\"1967\">1967</option>
<option value=\"1966\">1966</option>
<option value=\"1965\">1965</option>
<option value=\"1964\">1964</option>
<option value=\"1963\">1963</option>
<option value=\"1962\">1962</option>
<option value=\"1961\">1961</option>
<option value=\"1960\">1960</option>
<option value=\"1959\">1959</option>
<option value=\"1958\">1958</option>
<option value=\"1957\">1957</option>
<option value=\"1956\">1956</option>
<option value=\"1955\">1955</option>
<option value=\"1954\">1954</option>
<option value=\"1953\">1953</option>
<option value=\"1952\">1952</option>
<option value=\"1951\">1951</option>
<option value=\"1950\">1950</option>
<option value=\"1949\">1949</option>
<option value=\"1948\">1948</option>
<option value=\"1947\">1947</option>
<option value=\"1946\">1946</option>
<option value=\"1945\">1945</option>
<option value=\"1944\">1944</option>
<option value=\"1943\">1943</option>
<option value=\"1942\">1942</option>
<option value=\"1941\">1941</option>
<option value=\"1940\">1940</option>
<option value=\"1939\">1939</option>
<option value=\"1938\">1938</option>
<option value=\"1937\">1937</option>
<option value=\"1936\">1936</option>
<option value=\"1935\">1935</option>
<option value=\"1934\">1934</option>
<option value=\"1933\">1933</option>
<option value=\"1932\">1932</option>
<option value=\"1931\">1931</option>
<option value=\"1930\">1930</option>
<option value=\"1929\">1929</option>
<option value=\"1928\">1928</option>
<option value=\"1927\">1927</option>
<option value=\"1926\">1926</option>
<option value=\"1925\">1925</option>
<option value=\"1924\">1924</option>
<option value=\"1923\">1923</option>
<option value=\"1922\">1922</option>
<option value=\"1921\">1921</option>
<option value=\"1920\">1920</option>
<option value=\"1919\">1919</option>
<option value=\"1918\">1918</option>
<option value=\"1917\">1917</option>
<option value=\"1916\">1916</option>
<option value=\"1915\">1915</option>
<option value=\"1914\">1914</option>
<option value=\"1913\">1913</option>
<option value=\"1912\">1912</option>
<option value=\"1911\">1911</option>
<option value=\"1910\">1910</option>
<option value=\"1909\">1909</option>
<option value=\"1908\">1908</option>
<option value=\"1907\">1907</option>
<option value=\"1906\">1906</option>
<option value=\"1905\">1905</option></select></label>

<span style=\"display:block; font-size:17px; text-align:center; width:100%; position:relative; float:left; clear:left; margin-top:25px;\">
<a href=\"#\" id=\"enter\" style=\"padding:10px; text-decoration:none; color: orange; background-color:#B92028; z-index:999999\">ENTER</a>
</span>
</div>
</div>

<div id=\"liteq\" style=\"position:fixed;right:0px; bottom:-17px; z-index:100;\"><a href=\"https://abi-quiz.herokuapp.com/\"> <img src=\"https://www.international-breweries.com/v1/dquiz.png\" title=\"Take the Drink Lite Quiz\"> </a></div>
";
    }

    public function getTemplateName()
    {
        return "@ibplc/ifooter.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  313 => 189,  276 => 155,  268 => 150,  240 => 125,  232 => 120,  224 => 115,  215 => 109,  204 => 101,  195 => 95,  181 => 84,  173 => 79,  165 => 74,  157 => 69,  149 => 64,  141 => 59,  132 => 53,  120 => 44,  112 => 39,  104 => 34,  95 => 28,  85 => 21,  77 => 16,  69 => 11,  55 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "@ibplc/ifooter.html.twig", "/home2/interbrew/public_html/v1/themes/custom/ibplc/templates/ifooter.html.twig");
    }
}
