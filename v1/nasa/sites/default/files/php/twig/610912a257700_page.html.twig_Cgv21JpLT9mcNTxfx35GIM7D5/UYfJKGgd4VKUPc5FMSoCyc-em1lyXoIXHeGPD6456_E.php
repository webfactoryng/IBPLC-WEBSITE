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

/* themes/custom/ibplc/templates/page.html.twig */
class __TwigTemplate_718e6f927d85419e8478e1ec405e303e0229737fcd38573e4e1362b21d249a84 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["include" => 2];
        $filters = ["escape" => 7];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                ['include'],
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
        echo "<div class=\"page-container home\">
";
        // line 2
        $this->loadTemplate("@ibplc/imenux.html.twig", "themes/custom/ibplc/templates/page.html.twig", 2)->display($context);
        // line 3
        echo "<div>

    
<div class=\"ab-home-hero parbase\">    
 ";
        // line 7
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "content", [])), "html", null, true);
        echo "
    <div class=\"home-hero\">
        <div class=\"home-hero-inner\">
          <div class=\"home-hero--logo-container\">
          </div>
          <div class=\"home-hero--featured\">
            ";
        // line 13
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "main_banner", [])), "html", null, true);
        echo "  
          </div>

        </div>
      </div>

   
</div>


    
    
    <div class=\"ab-homepage-grid\"><div class=\"content-section empty-bg\">
    <div class=\"content-section-inner\">
        <div class=\"news-grid-home \">
            <div class=\"news-grid-home--header \">
                
            </div>  <div class=\"news-grid-home-inner\">
                <div class=\"news-grid-home--card-row featured ab-slider\" data-slider-options=\"\">
                    

</div>
  
  
  
  

            </div>

        </div>
    </div>
</div>

</div>


</div>




\t\t
";
        // line 55
        $this->loadTemplate("@ibplc/ifooter.html.twig", "themes/custom/ibplc/templates/page.html.twig", 55)->display($context);
        // line 56
        echo "\t</div>




<script type=\"text/javascript\" src=\"assets/clientlib-base.js\"></script>
<script type=\"text/javascript\" src=\"assets/bootstrap.customized.js\"></script>";
    }

    public function getTemplateName()
    {
        return "themes/custom/ibplc/templates/page.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  122 => 56,  120 => 55,  75 => 13,  66 => 7,  60 => 3,  58 => 2,  55 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "themes/custom/ibplc/templates/page.html.twig", "/home/nigerium/public_html/ibplcx/themes/custom/ibplc/templates/page.html.twig");
    }
}
